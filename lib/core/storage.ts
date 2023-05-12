import type { OptableConfig } from "../config";
import type { TargetingResponse } from "../edge/targeting";
import { lmpidProvider } from "../edge/targeting";

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
  private lmpidKey: string;

  constructor(private Config: OptableConfig) {
    const sfx = btoa(toBinary(`${this.Config.host}/${this.Config.site}`));
    // Legacy targeting key
    this.targetingV1Key = "OPTABLE_TGT_" + sfx;

    this.passportKey = "OPTABLE_PASS_" + sfx;
    this.targetingKey = "OPTABLE_V2_TGT_" + sfx;
    this.lmpidKey = "__lmpid"
  }

  getPassport(): string | null {
    return window.localStorage.getItem(this.passportKey);
  }

  getV1Targeting(): TargetingResponse | null {
    const raw = window.localStorage.getItem(this.targetingV1Key);
    const parsed = raw ? JSON.parse(raw) : null;
    if (!parsed) {
      return null
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
        ids: [].concat(...[values as any]).map((id: any) => ({id: String(id)})),
      }
    })

    return {
      user: [],
      audience: audiences,
    }
  }

  getTargeting(): TargetingResponse | null {
    const raw = window.localStorage.getItem(this.targetingKey);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed ? parsed : this.getV1Targeting()
  }

  setPassport(passport: string) {
    if (passport && passport.length > 0) {
      window.localStorage.setItem(this.passportKey, passport);
    }
  }

  setTargeting(targeting?: TargetingResponse | null) {
    if (!targeting) {
      return
    }

    window.localStorage.setItem(this.targetingKey, JSON.stringify(targeting));
    this.setLmpid(targeting)
  }

  // setLmpid conditionally set the Lmpid in local storage
  // based on the provider being present in the targeting response
  setLmpid(targeting: TargetingResponse) {
    const provider = targeting.user?.find((userIds) => userIds.provider === lmpidProvider);
    // Don't touch local storage if the provider is not enabled
    if (!provider) {
      return
    }

    window.localStorage.setItem(this.lmpidKey, provider.ids?.[0]?.id ?? "");
  }

  getLmpid(): string | null {
    return window.localStorage.getItem(this.lmpidKey) ?? null;
  }

  clearPassport() {
    window.localStorage.removeItem(this.passportKey);
  }

  clearTargeting() {
    window.localStorage.removeItem(this.targetingKey);
  }
}

export { LocalStorage, lmpidProvider };
export default LocalStorage;
