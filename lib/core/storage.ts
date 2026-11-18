import { sha256 } from "js-sha256";
import { SiteResponse } from "../edge/site";
import { mergeCache, replaceCache } from "./eid-cache";
import type { ResolvedCache } from "./eid-cache";
import type { ResolvedConfig } from "../config";
import type { TargetingResponse } from "../edge/targeting";
import { LocalStorageProxy } from "./regs/storage";
import {
  generatedPairKeys,
  generateOISKeys,
  generatePassportKeys,
  generateSiteKeys,
  generateTargetingKeys,
  StorageKeys,
} from "./storage-keys";

const pairEIDSource = "pair-protocol.com";

class LocalStorage {
  private passportKeys: StorageKeys;
  private targetingKeys: StorageKeys;
  private targetingTsKeys: StorageKeys;
  private targetingIdKeys: StorageKeys;
  private siteKeys: StorageKeys;
  private pairKeys: StorageKeys;
  private oisKeys: StorageKeys;
  private storage: LocalStorageProxy;

  constructor(private config: ResolvedConfig) {
    this.passportKeys = generatePassportKeys(config);
    this.targetingKeys = generateTargetingKeys(config);
    // "<key>:ts" siblings hold the epoch ms of the last targeting write, so analytics can
    // report cache age without changing the cache format that wrappers parse.
    this.targetingTsKeys = {
      read: this.targetingKeys.read.map((k) => `${k}:ts`),
      write: this.targetingKeys.write.map((k) => `${k}:ts`),
    };
    // "<key>:id" siblings fingerprint the identity a cached response was resolved
    // for, so carry-over stays within one identity.
    this.targetingIdKeys = {
      read: this.targetingKeys.read.map((k) => `${k}:id`),
      write: this.targetingKeys.write.map((k) => `${k}:id`),
    };
    this.siteKeys = generateSiteKeys(config);
    this.pairKeys = generatedPairKeys();
    this.oisKeys = generateOISKeys(config);
    this.storage = new LocalStorageProxy(this.config.consent);
  }

  getPassport(): string | null {
    return this.readStorageKeys(this.passportKeys);
  }

  setPassport(passport: string) {
    this.writeToStorageKeys(this.passportKeys, passport);
  }

  getVisitorId(): string | null {
    const passport = this.getPassport();
    if (!passport) return null;

    const payload = passport.split(".")[1];
    if (!payload) return null;

    try {
      // JWT payload is base64url; normalize to base64 before atob.
      const b64 = payload
        .replace(/-/g, "+")
        .replace(/_/g, "/")
        .padEnd(payload.length + ((4 - (payload.length % 4)) % 4), "=");
      const claims = JSON.parse(atob(b64));
      return typeof claims?.id === "string" ? claims.id : null;
    } catch {
      return null;
    }
  }

  getOIS(): string | null {
    return this.readStorageKeys(this.oisKeys);
  }

  setOIS(id: string) {
    this.writeToStorageKeys(this.oisKeys, id);
  }

  clearOIS() {
    this.clearStorageKeys(this.oisKeys);
  }

  oisKey(): string {
    return this.oisKeys.write[0];
  }

  getTargeting(): TargetingResponse | null {
    const raw = this.readStorageKeys(this.targetingKeys);
    return raw ? JSON.parse(raw) : null;
  }

  // merge carries cached EIDs forward for sources the response omits. Callers
  // that changed which matchers ran, such as an A/B arm, must pass false.
  // requestIds identifies who the response was resolved for; see identityOf.
  // Returns what was stored, so a caller can report the cache rather than the
  // response it sent.
  setTargeting(
    targeting?: TargetingResponse | null,
    options: { merge?: boolean; requestIds?: string[] } = {}
  ): TargetingResponse | null {
    if (!targeting) {
      return null;
    }

    // Stored copies always hold the cache format: source-keyed refs, no pointers.
    const incoming = replaceCache(targeting as ResolvedCache);
    const identity = this.identityOf(options.requestIds ?? []);
    const replacing = options.merge === false || !this.sameIdentity(identity);
    const next = replacing ? LocalStorage.dropRevoked(incoming) : this.mergeOntoCache(incoming);

    this.writeToStorageKeys(this.targetingKeys, JSON.stringify(next));
    this.writeToStorageKeys(this.targetingTsKeys, String(Date.now()));
    this.writeToStorageKeys(this.targetingIdKeys, identity);
    this.setPairIDs(targeting);
    return next as TargetingResponse;
  }

  // A source sent with no uids is a revocation, which mergeCache acts on. The
  // replace path has no cache to act against, so drop it here or it is stored
  // as an EID that enriches nothing.
  private static dropRevoked(cache: ResolvedCache): ResolvedCache {
    const eids = cache.ortb2?.user?.eids;
    if (!eids?.some((eid) => !eid.uids?.length)) {
      return cache;
    }

    return {
      ...cache,
      ortb2: { ...cache.ortb2, user: { ...cache.ortb2?.user, eids: eids.filter((eid) => eid.uids?.length) } },
    };
  }

  // Who a response was resolved for: the passport visitor id, plus one digest
  // per request id so the ids can be compared without being stored.
  private identityOf(requestIds: string[]): string {
    const ids = [...new Set(requestIds.map((id) => sha256.hex(id)))].sort();
    return JSON.stringify({ visitor: this.getVisitorId() ?? "", ids });
  }

  // Carry-over needs the same visitor and an id set that contradicts nothing
  // already cached. Either set containing the other means ids were added or
  // dropped, as signing in or out does; each side holding an id the other
  // lacks is a different person.
  private sameIdentity(identity: string): boolean {
    const stored = this.readStorageKeys(this.targetingIdKeys);
    if (!stored) {
      return false;
    }

    let cached: { visitor?: string; ids?: string[] };
    try {
      cached = JSON.parse(stored);
    } catch {
      return false;
    }

    const next = JSON.parse(identity) as { visitor: string; ids: string[] };
    if (cached.visitor !== next.visitor) {
      return false;
    }

    const cachedIds = cached.ids ?? [];
    const contains = (a: string[], b: string[]) => b.every((id) => a.includes(id));
    return contains(cachedIds, next.ids) || contains(next.ids, cachedIds);
  }

  // Keeps EIDs for sources the response omits, so an edge that resolved fewer
  // matchers does not cost bid density. Only the EID subset carries over.
  private mergeOntoCache(incoming: ResolvedCache): ResolvedCache {
    let cached: ResolvedCache | null = null;
    try {
      cached = this.getTargeting() as ResolvedCache | null;
    } catch {
      // Corrupt cache: merge onto nothing and overwrite it.
    }

    // Neither side listing eids means there is nothing to merge, so the
    // response stands as sent rather than gaining an empty list.
    if (!incoming.ortb2?.user?.eids && !cached?.ortb2?.user?.eids) {
      return incoming;
    }

    // Infinity because the cap belongs to whoever wrote the response, not to
    // this write path: mergeCache would otherwise trim every EID to 2 UIDs.
    const { merged } = mergeCache(incoming, cached, { maxUidsPerEid: Infinity });
    const eids = merged.ortb2?.user?.eids ?? [];
    return {
      ...incoming,
      ortb2: { ...incoming.ortb2, user: { ...incoming.ortb2?.user, eids } },
      refs: this.mergeRefs(eids, incoming, cached),
    };
  }

  // mergeCache rebuilds refs through getRefData, which keeps UID2 entries only.
  // Re-derive them so any other ref survives: a source the response re-sent
  // takes that response's ref, a carried-over one keeps the cached ref.
  private mergeRefs(
    eids: { source: string }[],
    incoming: ResolvedCache,
    cached: ResolvedCache | null
  ): Record<string, unknown> {
    const resent = new Set((incoming.ortb2?.user?.eids ?? []).map((eid) => eid.source));
    const refs: Record<string, unknown> = {};

    for (const { source } of eids) {
      const ref = (resent.has(source) ? incoming.refs : cached?.refs)?.[source];
      if (ref !== undefined) {
        refs[source] = ref;
      }
    }

    return refs;
  }

  // The private key is in both lists, and the public key can be unset.
  private targetingCopyKeys(): string[] {
    return [...new Set([...this.targetingKeys.read, ...this.targetingKeys.write])].filter(Boolean);
  }

  // Copies can hold different representations, so a caller that inspects the
  // cache has to see all of them.
  getTargetingCopies(): TargetingResponse[] {
    const copies: TargetingResponse[] = [];

    for (const key of this.targetingCopyKeys()) {
      const raw = this.storage.getItem(key);
      if (!raw) {
        continue;
      }

      try {
        copies.push(JSON.parse(raw));
      } catch {
        // Skip an unparseable copy.
      }
    }

    return copies;
  }

  // Updates every stored copy of the targeting response independently: the
  // private and public copies can hold different representations, so each is
  // read, updated and written back on its own. Returns the last updated copy.
  updateTargeting(update: (targeting: TargetingResponse) => boolean): TargetingResponse | null {
    let updated: TargetingResponse | null = null;

    for (const key of this.targetingCopyKeys()) {
      const raw = this.storage.getItem(key);
      if (!raw) {
        continue;
      }

      let targeting: TargetingResponse;
      try {
        targeting = JSON.parse(raw);
      } catch {
        // Leave an unparseable copy untouched.
        continue;
      }

      if (update(targeting)) {
        this.storage.setItem(key, JSON.stringify(targeting));
        updated = targeting;
      }
    }

    return updated;
  }

  getSite(): SiteResponse | null {
    const raw = this.readStorageKeys(this.siteKeys);
    return raw ? JSON.parse(raw) : null;
  }

  setSite(site?: SiteResponse | null) {
    if (!site) {
      return;
    }

    this.writeToStorageKeys(this.siteKeys, JSON.stringify(site));
  }

  setPairIDs(targeting: TargetingResponse) {
    const eids = targeting.ortb2?.user?.eids?.filter((eid) => eid.source === pairEIDSource);
    const uids = eids?.flatMap((eid) => eid.uids);
    if (!uids) {
      return;
    }

    const ids = new Set(uids.map((uid) => uid.id));
    this.writeToStorageKeys(this.pairKeys, btoa(JSON.stringify({ envelope: [...ids] })));
  }

  getPairIDs(): string[] | null {
    const raw = this.readStorageKeys(this.pairKeys);
    return raw ? JSON.parse(atob(raw))?.envelope : null;
  }

  // Returns the first key with data
  readStorageKeys(keys: StorageKeys): string | null {
    for (const key of keys.read) {
      const value = this.storage.getItem(key);
      if (value) {
        return value;
      }
    }

    return null;
  }

  writeToStorageKeys(keys: StorageKeys, value: string): void {
    if (value) {
      for (const key of keys.write) {
        this.storage.setItem(key, value);
      }
    }
  }

  clearStorageKeys(keys: StorageKeys): void {
    for (const key of [...keys.read, ...keys.write]) {
      this.storage.removeItem(key);
    }
  }

  clearPassport() {
    this.clearStorageKeys(this.passportKeys);
  }

  clearTargeting() {
    this.clearStorageKeys(this.targetingKeys);
    this.clearStorageKeys(this.targetingTsKeys);
    this.clearStorageKeys(this.targetingIdKeys);
  }

  clearSite() {
    this.clearStorageKeys(this.siteKeys);
  }
}

export type { StorageKeys as PassportKeys, ResolvedConfig };
export { LocalStorage };
export default LocalStorage;
