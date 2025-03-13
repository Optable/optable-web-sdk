import { SiteResponse } from "../edge/site";
import type { ResolvedConfig } from "../config";
import type { TargetingResponse } from "../edge/targeting";
import { LocalStorageProxy } from "./regs/storage";

export function encodeBase64(str: string): string {
  const codeUnits = new Uint16Array(str.length);
  for (let i = 0; i < codeUnits.length; i++) {
    codeUnits[i] = str.charCodeAt(i);
  }
  return btoa(String.fromCharCode(...new Uint8Array(codeUnits.buffer)));
}

// Used to create an old keygen for getItem only
export function deprecatedGenerateCacheKey(config: ResolvedConfig): string {
  if (config.legacyHostCache) {
    return encodeBase64(`${config.legacyHostCache}/${config.site}`);
  }

  return encodeBase64(`${config.host}/${config.site}`);
}

// Used as keygen for setting and getting from localstorage
export function generateCacheKey(config: ResolvedConfig): string {
  if (config.node) {
    return encodeBase64(`${config.host}/${config.node}`);
  }

  return encodeBase64(config.host);
}

class LocalStorage {
  private deprecatedPassportKey: string;
  private passportKey: string;
  private targetingKey: string;
  private siteKey: string;

  private storage: LocalStorageProxy;

  constructor(private config: ResolvedConfig) {
    // This is a deprecated keygen, keeping for backwards compatibility
    const deprecatedBase64ConfigKey = deprecatedGenerateCacheKey(config);
    const base64ConfigKey = generateCacheKey(config);

    this.deprecatedPassportKey = "OPTABLE_PASS_" + deprecatedBase64ConfigKey;
    this.passportKey = "OPTABLE_PASSPORT_" + base64ConfigKey;
    this.targetingKey = "OPTABLE_TARGETING_" + base64ConfigKey;
    this.siteKey = "OPTABLE_SITE_" + base64ConfigKey;
    this.storage = new LocalStorageProxy(this.config.consent);
  }

  getPassport(): string | null {
    return this.getFirstExistingItem(this.passportKey, this.deprecatedPassportKey);
  }

  getTargeting(): TargetingResponse | null {
    const raw = this.storage.getItem(this.targetingKey);
    return raw ? JSON.parse(raw) : null;
  }

  setPassport(passport: string) {
    if (passport && passport.length > 0) {
      this.storage.setItem(this.passportKey, passport);
    }
  }

  setTargeting(targeting?: TargetingResponse | null) {
    if (!targeting) {
      return;
    }

    this.storage.setItem(this.targetingKey, JSON.stringify(targeting));
  }

  setSite(site?: SiteResponse | null) {
    if (!site) {
      return;
    }
    this.storage.setItem(this.siteKey, JSON.stringify(site));
  }

  getSite(): SiteResponse | null {
    const raw = this.storage.getItem(this.siteKey);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed;
  }

  getFirstExistingItem(...keys: string[]): string | null {
    for (const key of keys) {
      const value = this.storage.getItem(key);
      if (value) {
        return value;
      }
    }
    return null;
  }

  clearPassport() {
    this.storage.removeItem(this.passportKey);
    this.storage.removeItem(this.deprecatedPassportKey);
  }

  clearTargeting() {
    this.storage.removeItem(this.targetingKey);
  }

  clearSite() {
    this.storage.removeItem(this.siteKey);
  }
}

export { LocalStorage };
export default LocalStorage;
