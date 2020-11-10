import type { OptableConfig } from "./config";
import type { TargetingKeyValues } from "./edge/targeting";
import type { WitnessProperties } from "./edge/witness";
import { Identify } from "./edge/identify";
import { Witness } from "./edge/witness";
import { Targeting, TargetingFromCache, TargetingClearCache } from "./edge/targeting";
import { sha256 } from "js-sha256";

class OptableSDK {
  constructor(public sandbox: OptableConfig) {}

  identify(...ids: string[]) {
    return Identify(
      this.sandbox,
      ids.filter((id) => id)
    );
  }

  targeting(): Promise<TargetingKeyValues> {
    return Targeting(this.sandbox);
  }

  targetingFromCache(): TargetingKeyValues | null {
    return TargetingFromCache(this.sandbox);
  }

  targetingClearCache() {
    TargetingClearCache(this.sandbox);
  }

  witness(event: string, properties: WitnessProperties = {}): Promise<void> {
    return Witness(this.sandbox, event, properties);
  }

  static eid(email: string): string {
    return email ? "e:" + sha256.hex(email.toLowerCase().trim()) : "";
  }

  static cid(ppid: string): string {
    return ppid ? "c:" + ppid.trim() : "";
  }
}

export { OptableSDK };
export type { OptableConfig };
export default OptableSDK;
