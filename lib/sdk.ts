import type { InitConfig, ResolvedConfig } from "./config";
import { default as buildInfo } from "./build.json";
import { getConfig } from "./config";
import type { WitnessProperties } from "./edge/witness";
import type { ProfileTraits } from "./edge/profile";
import type { PageContextConfig, ContextData } from "./core/context";
import { extractContext, normalizeContextConfig } from "./core/context";
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
import {
  ContextualSegments,
  ContextualSegmentsResponse,
  ContextualTargetingKeyValues,
  ContextualTargetingKeyValuesOptions,
} from "./edge/contextual_segments";
import { sha256 } from "js-sha256";
import { Tokenize, TokenizeResponse } from "./edge/tokenize";
import { LocalStorage } from "./core/storage";
import { clearOISID, getOISID, getOISState } from "./core/ois";
import { consoleLog } from "./core/log";
import type { OISState } from "./core/ois";

class OptableSDK {
  public static version = buildInfo.version;

  public dcn: ResolvedConfig;
  protected init: Promise<void>;

  private contextSent: boolean = false;
  private contextConfig: PageContextConfig | null = null;
  private contextualResponse: ContextualSegmentsResponse | null = null;
  // Accessors that can legitimately return null before initialization warn once
  // per instance, so a page polling one of them does not flood the console.
  private warned = new Set<string>();

  constructor(dcn: InitConfig) {
    this.dcn = getConfig(dcn);
    this.contextConfig = normalizeContextConfig(dcn.pageContext);
    if (this.dcn.initContextual && !this.contextConfig) {
      this.contextConfig = {};
    }
    this.init = this.initialize();
  }

  async initialize(): Promise<void> {
    if (this.dcn.initPassport) {
      await Site(this.dcn).catch(() => {});
    }

    if (this.dcn.initTargeting) {
      this.targeting().catch(() => {});
    }

    if (this.dcn.initContextual) {
      const url = `${window.location.hostname}${window.location.pathname}`;
      this.witness("pageview", { url }, { includeContext: true }).catch(() => {});

      const onSegments = typeof this.dcn.initContextual === "function" ? this.dcn.initContextual : null;
      const promise = this.ctxSegments();
      (onSegments ? promise.then(onSegments) : promise).catch(() => {});
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

  private warnOnce(key: string, message: string): void {
    if (this.warned.has(key)) {
      return;
    }
    this.warned.add(key);
    consoleLog("[Optable]", "warn", message);
  }

  passport(): string | null {
    const value = new LocalStorage(this.dcn).getPassport();
    if (value === null) {
      this.warnOnce(
        "passport",
        "passport() returned null. The passport is cached in localStorage once the DCN returns one. " +
          "Call before initialization (await sdk.site() or sdk.targeting()) may return null, and deployments where the DCN " +
          "does not echo the passport in response bodies will never populate it client-side."
      );
    }
    return value;
  }

  visitorId(): string | null {
    const value = new LocalStorage(this.dcn).getVisitorId();
    if (value === null) {
      this.warnOnce(
        "visitorId",
        "visitorId() returned null. The visitor ID is derived from the passport JWT in localStorage. " +
          "Call before initialization (await sdk.site() or sdk.targeting()) may return null, and deployments where the DCN " +
          "does not echo the passport in response bodies will never populate it client-side."
      );
    }
    return value;
  }

  // The stored derived OIS id, or null when the node has not returned one
  // yet. Requires the `ois` config option.
  //
  // This is not the cookie identity: OPTABLE_OID is HttpOnly and never readable
  // from JavaScript.
  oisId(): string | null {
    const value = getOISID(this.dcn);
    if (value === null && this.dcn.ois) {
      this.warnOnce(
        "oisId",
        "oisId() returned null. The derived OIS id is cached once the DCN returns it on the X-Optable-OID " +
          "response header, which happens on the first identify(), targeting() or profile() call — not during " +
          "initialization. A node with OIS ID derivation disabled, or a non-residential IP, never returns one."
      );
    }
    return value;
  }

  // The stored derived OIS id and the localStorage key holding it.
  oisState(): OISState {
    return getOISState(this.dcn);
  }

  // Forgets the stored OIS id. The node issues a new one on the next call.
  oisClear(): void {
    clearOISID(this.dcn);
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

  async witness(
    event: string,
    properties: WitnessProperties = {},
    options: { includeContext?: boolean } = {}
  ): Promise<void> {
    await this.init;

    let context: ContextData | undefined;
    if (options.includeContext && this.contextConfig && !this.contextSent) {
      context = extractContext(this.contextConfig);
      this.contextSent = true;
    }

    return Witness(this.dcn, event, properties, context);
  }

  resetContext(): void {
    this.contextSent = false;
  }

  async profile(traits: ProfileTraits, id: string | null = null, neighbors: string[] | null = null): Promise<void> {
    await this.init;
    return Profile(this.dcn, traits, id, neighbors);
  }

  async ctxSegments(url?: string): Promise<ContextualSegmentsResponse> {
    const response = await ContextualSegments(this.dcn, url ?? window.location.href);
    this.contextualResponse = response;
    return response;
  }

  ctxTargetingKeyValues(
    taxonomyKeys?: Record<string, string>,
    options?: ContextualTargetingKeyValuesOptions
  ): ContextualTargetingKeyValues {
    return ContextualTargetingKeyValues(this.contextualResponse, taxonomyKeys, options);
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
