import type { OptableConfig } from "../config";
import type { TargetingKeyValues } from "../edge/targeting";

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

  constructor(private Config: OptableConfig) {
    const sfx = btoa(toBinary(`${this.Config.host}/${this.Config.site}`));
    this.passportKey = "OPTABLE_PASS_" + sfx;
    this.targetingKey = "OPTABLE_TGT_" + sfx;
  }

  getPassport(): string | null {
    return window.localStorage.getItem(this.passportKey);
  }

  getTargeting(): TargetingKeyValues | null {
    const kvs = window.localStorage.getItem(this.targetingKey);
    return kvs ? (JSON.parse(kvs) as TargetingKeyValues) : null;
  }

  setPassport(passport: string) {
    if (passport && passport.length > 0) {
      window.localStorage.setItem(this.passportKey, passport);
    }
  }

  setTargeting(keyvalues: TargetingKeyValues) {
    if (keyvalues) {
      window.localStorage.setItem(this.targetingKey, JSON.stringify(keyvalues));
    }
  }

  clearPassport() {
    window.localStorage.removeItem(this.passportKey);
  }

  clearTargeting() {
    window.localStorage.removeItem(this.targetingKey);
  }
}

export { LocalStorage };
export default LocalStorage;
