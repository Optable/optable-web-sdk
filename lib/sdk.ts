import type { OptableConfig } from "./config";
import type { WitnessProperties } from "./edge/witness";
import type { ProfileTraits } from "./edge/profile";
import { Identify } from "./edge/identify";
import { Uid2Token } from "./edge/uid2_token";
import {
  TargetingKeyValues,
  PrebidUserData,
  TargetingResponse,
  Targeting,
  TargetingFromCache,
  TargetingClearCache
} from "./edge/targeting";
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

  uid2Token(id: string) {
    return Uid2Token(this.dcn, id);
  }

  targeting(): Promise<TargetingResponse> {
    return Targeting(this.dcn);
  }

  targetingFromCache(): TargetingResponse | null {
    return TargetingFromCache(this.dcn);
  }

  targetingClearCache() {
    TargetingClearCache(this.dcn);
  }

  async prebidUserData(): Promise<PrebidUserData> {
    return PrebidUserData(await this.targeting())
  }

  prebidUserDataFromCache(): PrebidUserData {
    const tdata = this.targetingFromCache()
    return PrebidUserData(tdata);
  }

  async targetingKeyValues(): Promise<TargetingKeyValues> {
    return TargetingKeyValues(await this.targeting())
  }

  targetingKeyValuesFromCache(): TargetingKeyValues {
    const tdata = this.targetingFromCache()
    return TargetingKeyValues(tdata);
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

  static TargetingKeyValues(tdata: TargetingResponse): TargetingKeyValues {
    return TargetingKeyValues(tdata)
  }

  static PrebidUserData(tdata: TargetingResponse): PrebidUserData {
    return PrebidUserData(tdata)
  }
}

export { OptableSDK };
export type { OptableConfig };
export default OptableSDK;
