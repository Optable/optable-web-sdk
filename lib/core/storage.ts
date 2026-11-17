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
  setTargeting(targeting?: TargetingResponse | null, options: { merge?: boolean } = {}) {
    if (!targeting) {
      return;
    }

    // Stored copies always hold the cache format: source-keyed refs, no pointers.
    const incoming = replaceCache(targeting as ResolvedCache);
    const next = options.merge === false ? incoming : this.mergeOntoCache(incoming);

    this.writeToStorageKeys(this.targetingKeys, JSON.stringify(next));
    this.writeToStorageKeys(this.targetingTsKeys, String(Date.now()));
    this.setPairIDs(targeting);
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
    return {
      ...incoming,
      ortb2: { ...incoming.ortb2, user: { ...incoming.ortb2?.user, eids: merged.ortb2?.user?.eids ?? [] } },
      refs: merged.refs,
    };
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
  }

  clearSite() {
    this.clearStorageKeys(this.siteKeys);
  }
}

export type { StorageKeys as PassportKeys, ResolvedConfig };
export { LocalStorage };
export default LocalStorage;
