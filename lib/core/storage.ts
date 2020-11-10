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
  private targetingKey: string;

  constructor(private Config: OptableConfig) {
    const sfx = btoa(toBinary(`${this.Config.host}/${this.Config.site}`));
    this.targetingKey = "OPTABLE_TGT_" + sfx;
  }

  getTargeting(): TargetingKeyValues | null {
    const kvs = window.localStorage.getItem(this.targetingKey);
    return kvs ? (JSON.parse(kvs) as TargetingKeyValues) : null;
  }

  setTargeting(keyvalues: TargetingKeyValues) {
    if (keyvalues) {
      window.localStorage.setItem(this.targetingKey, JSON.stringify(keyvalues));
    }
  }

  clearTargeting() {
    window.localStorage.removeItem(this.targetingKey);
  }
}

export { LocalStorage };
export default LocalStorage;
