import type { InitConfig, ResolvedConfig } from "./config";
import { default as buildInfo } from "./build.json";
import { getConfig } from "./config";
import type { WitnessProperties } from "./edge/witness";
import type { ProfileTraits } from "./edge/profile";
import { Identify } from "./edge/identify";
import { Uid2Token, Uid2TokenResponse } from "./edge/uid2_token";
import { Resolve, ResolveResponse } from "./edge/resolve";
import { Site, SiteResponse, SiteFromCache } from "./edge/site";
import { isObject } from "./core/utils";
import {
  TargetingKeyValues,
  TargetingResponse,
  TargetingRequest,
  Targeting,
  TargetingFromCache,
  TargetingClearCache,
  PrebidORTB2,
} from "./edge/targeting";
import { Witness } from "./edge/witness";
import { Profile } from "./edge/profile";
import { sha256 } from "js-sha256";
import { Tokenize, TokenizeResponse } from "./edge/tokenize";

class OptableSDK {
  public static version = buildInfo.version;

  public dcn: ResolvedConfig;
  protected init: Promise<void>;

  constructor(dcn: InitConfig) {
    this.dcn = getConfig(dcn);
    this.init = this.initialize();
  }

  async initialize(): Promise<void> {
    if (this.dcn.initPassport) {
      await Site(this.dcn).catch(() => {});
    }

    if (this.dcn.initTargeting) {
      this.targeting().catch(() => {});
    }
  }

  async identify(...ids: string[]): Promise<void> {
    await this.init;
    return Identify(
      this.dcn,
      ids.filter((id) => id)
    );
  }

  async uid2Token(id: string): Promise<Uid2TokenResponse> {
    await this.init;
    return Uid2Token(this.dcn, id);
  }

  async targeting(input: string | TargetingRequest = "__passport__"): Promise<TargetingResponse> {
    const request = normalizeTargetingRequest(input);

    if (request.ids.length > 1 && !this.dcn.experiments.includes("targeting-cascade")) {
      throw "Targeting multiple IDs is only available with the 'targeting-cascade' experiment enabled.";
    }

    await this.init;
    return Targeting(this.dcn, request);
  }

  targetingFromCache(): TargetingResponse | null {
    return TargetingFromCache(this.dcn);
  }

  async site(): Promise<SiteResponse> {
    return Site(this.dcn);
  }

  siteFromCache(): SiteResponse | null {
    return SiteFromCache(this.dcn);
  }

  targetingClearCache(): void {
    TargetingClearCache(this.dcn);
  }

  async prebidORTB2(): Promise<PrebidORTB2> {
    return PrebidORTB2(await this.targeting());
  }

  prebidORTB2FromCache(): PrebidORTB2 {
    const tdata = this.targetingFromCache();
    return PrebidORTB2(tdata);
  }

  async targetingKeyValues(): Promise<TargetingKeyValues> {
    return TargetingKeyValues(await this.targeting());
  }

  targetingKeyValuesFromCache(): TargetingKeyValues {
    const tdata = this.targetingFromCache();
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

  async tokenize(id: string): Promise<TokenizeResponse> {
    await this.init;
    return Tokenize(this.dcn, id);
  }

  async resolve(id?: string): Promise<ResolveResponse> {
    await this.init;
    return Resolve(this.dcn, id);
  }

  static eid(email: string): string {
    return email ? "e:" + sha256.hex(email.toLowerCase().trim()) : "";
  }

  static sha256(string: string): string {
    return string ? sha256.hex(string) : "";
  }

  static cid(ppid: string, variant: number = 0): string {
    let prefix = "c:";

    if (typeof ppid !== "string") {
      throw new Error("Invalid ppid");
    }

    if (typeof variant !== "number" || isNaN(variant) || variant < 0 || variant > 19) {
      throw new Error("Invalid variant");
    }

    if (variant > 0) {
      prefix = `c${variant}:`;
    }

    return ppid ? prefix + ppid.trim() : "";
  }

  static TargetingKeyValues(tdata: TargetingResponse): TargetingKeyValues {
    return TargetingKeyValues(tdata);
  }

  static PrebidORTB2(tdata: TargetingResponse): PrebidORTB2 {
    return PrebidORTB2(tdata);
  }
}

function normalizeTargetingRequest(input: string | TargetingRequest): TargetingRequest {
  if (typeof input === "string") {
    return { ids: [input], hids: [] };
  }

  if (isObject(input)) {
    return { ids: input?.ids ?? [], hids: input?.hids ?? [] };
  }

  throw "Invalid request type for targeting. Expected string or object.";
}

export { OptableSDK, normalizeTargetingRequest };
export type { InitConfig };
export default OptableSDK;
