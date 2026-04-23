import { SiteResponse } from "../edge/site";
import type { ResolvedConfig } from "../config";
import type { TargetingResponse } from "../edge/targeting";
import { LocalStorageProxy } from "./regs/storage";
import {
  generatedPairKeys,
  generatePassportKeys,
  generateSiteKeys,
  generateTargetingKeys,
  StorageKeys,
} from "./storage-keys";

const pairEIDSource = "pair-protocol.com";

class LocalStorage {
  private passportKeys: StorageKeys;
  private targetingKeys: StorageKeys;
  private siteKeys: StorageKeys;
  private pairKeys: StorageKeys;
  private storage: LocalStorageProxy;

  constructor(private config: ResolvedConfig) {
    this.passportKeys = generatePassportKeys(config);
    this.targetingKeys = generateTargetingKeys(config);
    this.siteKeys = generateSiteKeys(config);
    this.pairKeys = generatedPairKeys();
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
      const b64 = payload.replace(/-/g, "+").replace(/_/g, "/").padEnd(
        payload.length + ((4 - (payload.length % 4)) % 4),
        "="
      );
      const claims = JSON.parse(atob(b64));
      return typeof claims?.id === "string" ? claims.id : null;
    } catch {
      return null;
    }
  }

  getTargeting(): TargetingResponse | null {
    const raw = this.readStorageKeys(this.targetingKeys);
    return raw ? JSON.parse(raw) : null;
  }

  setTargeting(targeting?: TargetingResponse | null) {
    if (!targeting) {
      return;
    }

    this.writeToStorageKeys(this.targetingKeys, JSON.stringify(targeting));
    this.setPairIDs(targeting);
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
  }

  clearSite() {
    this.clearStorageKeys(this.siteKeys);
  }
}

export type { StorageKeys as PassportKeys, ResolvedConfig };
export { LocalStorage };
export default LocalStorage;
