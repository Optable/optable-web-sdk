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
import { sendTargetingCacheRefreshEvent } from "./events/cache-refresh";

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
    console.log("configs in constructor:", config);
  }

  getPassport(): string | null {
    return this.readStorageKeys(this.passportKeys);
  }

  setPassport(passport: string) {
    this.writeToStorageKeys(this.passportKeys, passport);
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
    console.log("config in targeting:", this.config);
    sendTargetingCacheRefreshEvent(this.config, targeting);
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
    for (const key of keys.read) {
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
