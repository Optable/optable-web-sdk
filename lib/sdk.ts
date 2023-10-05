import type { OptableConfig } from "./config";
import type { WitnessProperties } from "./edge/witness";
import type { ProfileTraits } from "./edge/profile";
import { Identify } from "./edge/identify";
import { Uid2Token } from "./edge/uid2_token";
import { Init } from "./edge/init";
import { Site, SiteResponse } from "./edge/site";
import {
  TargetingKeyValues,
  TargetingResponse,
  Targeting,
  TargetingFromCache,
  TargetingClearCache,
  PrebidORTB2,
  LmpidFromCache
} from "./edge/targeting";
import { Witness } from "./edge/witness";
import { Profile } from "./edge/profile";
import { sha256 } from "js-sha256";

class OptableSDK {
  public sandbox: OptableConfig; // legacy
  private init: any

  constructor(public dcn: OptableConfig, writePassport: boolean = true) {
    this.sandbox = dcn; // legacy
    this.init = writePassport ? Init(dcn).catch(()=>{}) : undefined;
  }

  async identify(...ids: string[]) {
    await this.init;
    return Identify(
      this.dcn,
      ids.filter((id) => id)
    );
  }

  async uid2Token(id: string) {
    await this.init;
    return Uid2Token(this.dcn, id);
  }

  async targeting(): Promise<TargetingResponse> {
    await this.init;
    return Targeting(this.dcn);
  }

  targetingFromCache(): TargetingResponse | null {
    return TargetingFromCache(this.dcn);
  }

  targetingClearCache() {
    TargetingClearCache(this.dcn);
  }

  lmpidFromCache(): string | null {
    return LmpidFromCache(this.dcn)
  }

  async prebidORTB2(): Promise<PrebidORTB2> {
    return PrebidORTB2(await this.targeting())
  }

  async site(): Promise<SiteResponse> {
    return Site(this.dcn)
  }

  prebidORTB2FromCache(): PrebidORTB2 {
    const tdata = this.targetingFromCache()
    return PrebidORTB2(tdata);
  }

  async targetingKeyValues(): Promise<TargetingKeyValues> {
    return TargetingKeyValues(await this.targeting())
  }

  targetingKeyValuesFromCache(): TargetingKeyValues {
    const tdata = this.targetingFromCache()
    return TargetingKeyValues(tdata);
  }

  async witness(event: string, properties: WitnessProperties = {}): Promise<void> {
    await this.init;
    return Witness(this.dcn, event, properties);
  }

  async profile(traits: ProfileTraits): Promise<void> {
    await this.init;
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

  static PrebidORTB2(tdata: TargetingResponse): PrebidORTB2 {
    return PrebidORTB2(tdata)
  }
}

export { OptableSDK };
export type { OptableConfig };
export default OptableSDK;
