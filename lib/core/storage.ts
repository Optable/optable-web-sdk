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
  private targetingV1Key: string;
  private targetingKey: string;
  private siteKey: string;

  private storage: LocalStorageProxy;

  constructor(private config: ResolvedConfig) {
    const sfx = btoa(toBinary(`${this.config.host}/${this.config.site}`));
    // Legacy targeting key
    this.targetingV1Key = "OPTABLE_TGT_" + sfx;

    this.passportKey = "OPTABLE_PASS_" + sfx;
    this.targetingKey = "OPTABLE_V2_TGT_" + sfx;
    this.siteKey = "OPTABLE_SITE_" + sfx;
    this.storage = new LocalStorageProxy(this.config.consent);
  }

  getPassport(): string | null {
    return this.storage.getItem(this.passportKey);
  }

  getV1Targeting(): TargetingResponse | null {
    const raw = this.storage.getItem(this.targetingV1Key);
    const parsed = raw ? JSON.parse(raw) : null;
    if (!parsed) {
      return null;
    }

    const audiences = Object.entries(parsed).map(([keyspace, values]) => {
      return {
        provider: "optable.co",
        keyspace,
        // 5001 is Optable Private Member Defined Audiences
        // See: https://github.com/InteractiveAdvertisingBureau/openrtb/pull/81
        //
        // Starting v2 this is returned in the targeting payload directly
        rtb_segtax: 5001,
        ids: [].concat(...[values as any]).map((id: any) => ({ id: String(id) })),
      };
    });

    return {
      user: [],
      audience: audiences,
    };
  }

  getTargeting(): TargetingResponse | null {
    const raw = this.storage.getItem(this.targetingKey);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed ? parsed : this.getV1Targeting();
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
    const raw = localStorage.getItem(this.siteKey);
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
