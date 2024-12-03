import { SiteResponse } from "../edge/site";
import type { OptableConfig } from "../config";
import type { TargetingResponse } from "../edge/targeting";
import { localStorage } from "./regs/storage";

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

  constructor(private Config: OptableConfig) {
    const sfx = btoa(toBinary(`${this.Config.host}/${this.Config.site}`));
    // Legacy targeting key
    this.targetingV1Key = "OPTABLE_TGT_" + sfx;

    this.passportKey = "OPTABLE_PASS_" + sfx;
    this.targetingKey = "OPTABLE_V2_TGT_" + sfx;
    this.siteKey = "OPTABLE_SITE_" + sfx;
  }

  getPassport(): string | null {
    return localStorage.getItem(this.passportKey);
  }

  getV1Targeting(): TargetingResponse | null {
    const raw = localStorage.getItem(this.targetingV1Key);
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
    const raw = localStorage.getItem(this.targetingKey);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed ? parsed : this.getV1Targeting();
  }

  setPassport(passport: string) {
    if (passport && passport.length > 0) {
      localStorage.setItem(this.passportKey, passport);
    }
  }

  setTargeting(targeting?: TargetingResponse | null) {
    if (!targeting) {
      return;
    }

    localStorage.setItem(this.targetingKey, JSON.stringify(targeting));
  }

  setSite(site?: SiteResponse | null) {
    if (!site) {
      return;
    }
    localStorage.setItem(this.siteKey, JSON.stringify(site));
  }

  getSite(): SiteResponse | null {
    const raw = localStorage.getItem(this.siteKey);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed;
  }

  clearPassport() {
    localStorage.removeItem(this.passportKey);
  }

  clearTargeting() {
    localStorage.removeItem(this.targetingKey);
  }

  clearSite() {
    localStorage.removeItem(this.siteKey);
  }
}

export { LocalStorage };
export default LocalStorage;
