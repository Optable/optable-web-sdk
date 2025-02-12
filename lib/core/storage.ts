import { SiteResponse } from "../edge/site";
import type { ResolvedConfig } from "../config";
import type { TargetingResponse } from "../edge/targeting";
import { LocalStorageProxy } from "./regs/storage";

function toBinary(str: string): string {
  const codeUnits = new Uint16Array(str.length);
  for (let i = 0; i < codeUnits.length; i++) {
    codeUnits[i] = str.charCodeAt(i);
  }
  return String.fromCharCode(...new Uint8Array(codeUnits.buffer));
}

class LocalStorage {
  private passportKey: string;
  private targetingKey: string;
  private siteKey: string;

  private storage: LocalStorageProxy;

  constructor(private config: ResolvedConfig) {
    const sfx = btoa(toBinary(`${this.config.host}/${this.config.site}`));
    this.passportKey = "OPTABLE_PASS_" + sfx;
    this.targetingKey = "OPTABLE_V2_TGT_" + sfx;
    this.siteKey = "OPTABLE_SITE_" + sfx;
    this.storage = new LocalStorageProxy(this.config.consent);
  }

  getPassport(): string | null {
    return this.storage.getItem(this.passportKey);
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

  clearPassport() {
    this.storage.removeItem(this.passportKey);
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
