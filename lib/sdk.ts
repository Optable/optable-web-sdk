import type { OptableConfig } from "./config";
import { PrebidUserData, PrebidUserDataFromCache, TargetingKeyValues } from "./edge/targeting";
import type { WitnessProperties } from "./edge/witness";
import type { ProfileTraits } from "./edge/profile";
import { Identify } from "./edge/identify";
import { Targeting, TargetingFromCache, TargetingClearCache } from "./edge/targeting";
import { Witness } from "./edge/witness";
import { Profile } from "./edge/profile";
import { sha256 } from "js-sha256";

class OptableSDK {
  public sandbox: OptableConfig; // legacy

  constructor(public dcn: OptableConfig) {
    this.sandbox = dcn; // legacy
  }

  identify(...ids: string[]) {
    return Identify(
      this.dcn,
      ids.filter((id) => id)
    );
  }

  targeting(): Promise<TargetingKeyValues> {
    return Targeting(this.dcn);
  }

  targetingFromCache(): TargetingKeyValues | null {
    return TargetingFromCache(this.dcn);
  }

  targetingClearCache() {
    TargetingClearCache(this.dcn);
  }

  prebidUserDataFromCache(): PrebidUserData {
    return PrebidUserDataFromCache(this.dcn);
  }

  witness(event: string, properties: WitnessProperties = {}): Promise<void> {
    return Witness(this.dcn, event, properties);
  }

  profile(traits: ProfileTraits): Promise<void> {
    return Profile(this.dcn, traits);
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
