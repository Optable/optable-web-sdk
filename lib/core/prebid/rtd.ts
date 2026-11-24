// RTD (Real-Time Data) module for Prebid.js integration
import { targetingEventName } from "../events/cache-refresh";
import { flagEnabled } from "../flags";
import { consoleLog } from "../log";
import { CONTEXTUAL_DATA_NAME, ContextualPrebidORTB2 } from "../../edge/contextual_segments";
import type { ContextualSegmentsResponse } from "../../edge/contextual_segments";

// Type definitions
interface EID {
  source: string;
  uids: Array<{
    id?: string;
    atype?: number;
    ext?: {
      provider?: string;
    };
  }>;
  matcher?: string;
}

interface EIDSource {
  routes?: string[];
  route?: string;
  mergeStrategy?: MergeStrategy;
}

interface ORTB2User {
  eids?: EID[];
  ext?: {
    eids?: EID[];
  };
}

interface ORTB2Site {
  content?: {
    data?: Array<{ name?: string; [key: string]: unknown }>;
    keywords?: string;
    kwarray?: string[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface ORTB2 {
  user?: ORTB2User;
  site?: ORTB2Site;
}

interface TargetingData {
  ortb2?: {
    user?: {
      eids?: EID[];
    };
  };
}

interface ReqBidsConfigObj {
  ortb2Fragments: {
    global: ORTB2;
    bidder: {
      [bidderName: string]: ORTB2;
    };
  };
}

type MergeStrategy = (existingEids: EID[], newEids: EID[], key?: (eid: EID) => string) => EID[];

interface RTDConfig {
  enableLogging: boolean;
  log: (level: string, message: string, ...args: any[]) => void;
  eidSources: { [source: string]: EIDSource };
  skipMerge: (targetORTB2: ORTB2, eidSource: string) => boolean;
  optableCacheTargeting: string;
  matcherFilter: string[];
  matcherExclude: string[];
  mergeStrategy?: MergeStrategy;
  appendMergeStrategy: MergeStrategy;
  prependMergeStrategy: MergeStrategy;
  replaceMergeStrategy: MergeStrategy;
  appendNewMergeStrategy: MergeStrategy;
  targetingFromCache: (config?: RTDConfig) => TargetingData | null;
  handleRtd: (reqBidsConfigObj: ReqBidsConfigObj, optableExtraData?: any, mergeFn?: any) => Promise<void | null>;
  instance: string;
  prebidGlobal: string;
  waitForTargeting: boolean;
  enableContextual: () => boolean;
  isControlGroup: () => boolean;
}

interface RTDOptions {
  enableLogging?: boolean;
  eidSources?: { [source: string]: EIDSource };
  skipMerge?: (targetORTB2: ORTB2, eidSource: string) => boolean;
  optableCacheTargeting?: string;
  matcherFilter?: string[];
  matcherExclude?: string[];
  targetingData?: TargetingData;
  forceGlobalRouting?: boolean;
  mergeStrategy?: MergeStrategy;
  instance?: string;
  // Prebid global whose realTimeData.auctionDelay bounds the waitForTargeting wait.
  prebidGlobal?: string;
  waitForTargeting?: boolean;
  // Evaluated per auction; off unless the wrapper turns it on.
  enableContextual?: () => boolean;
  // Split-test gate: serves no EIDs while true, but still serves contextual data.
  isControlGroup?: () => boolean;
}

// Merge strategies for EIDs
function appendMergeStrategy(existingEids: EID[], newEids: EID[]): EID[] {
  return [...existingEids, ...newEids];
}

function prependMergeStrategy(existingEids: EID[], newEids: EID[]): EID[] {
  return [...newEids, ...existingEids];
}

function replaceMergeStrategy(existingEids: EID[], newEids: EID[], key: (e: EID) => string = (e) => e.source): EID[] {
  const existingByKey = existingEids.reduce((acc: { [key: string]: EID[] }, eid) => {
    acc[key(eid)] = acc[key(eid)] ?? [];
    acc[key(eid)].push(eid);
    return acc;
  }, {});

  const newByKey = newEids.reduce((acc: { [key: string]: EID[] }, eid) => {
    acc[key(eid)] = acc[key(eid)] ?? [];
    acc[key(eid)].push(eid);
    return acc;
  }, {});

  const result = Object.values({ ...existingByKey, ...newByKey });
  return result.flat();
}

function appendNewMergeStrategy(existingEids: EID[], newEids: EID[], key: (e: EID) => string = (e) => e.source): EID[] {
  const existingByKey = existingEids.reduce((acc: { [key: string]: EID[] }, eid) => {
    acc[key(eid)] = acc[key(eid)] ?? [];
    acc[key(eid)].push(eid);
    return acc;
  }, {});

  const newByKey = newEids.reduce((acc: { [key: string]: EID[] }, eid) => {
    acc[key(eid)] = acc[key(eid)] ?? [];
    acc[key(eid)].push(eid);
    return acc;
  }, {});

  const result = Object.values({ ...newByKey, ...existingByKey });
  return result.flat();
}

const defaultEIDSources: { [source: string]: EIDSource } = {
  "adnxs.com": { routes: ["appnexus", "appnexus_s2s", "appnexus-s2s"] },
  "gumgum.com": { routes: ["gumgum", "gumgum_s2s", "gumgum-s2s"] },
  "indexexchange.com": { routes: ["ix", "ix_s2s", "ix-s2s"] },
  "kargo.com": { routes: ["kargo", "kargo_s2s", "kargo-s2s"] },
  "openx.com": { routes: ["openx", "openx_s2s", "openx-s2s"] },
  "pubmatic.com": { routes: ["pubmatic", "pubmatic_s2s", "pubmatic-s2s"] },
  "rubiconproject.com": { routes: ["rubicon", "rubicon_s2s", "rubicon-s2s"] },
  "smartadserver.com": { routes: ["smartadserver", "smartadserver_s2s", "smartadserver-s2s"] },
  "sovrn.com": { routes: ["sovrn", "sovrn_s2s", "sovrn-s2s"] },
  "triplelift.com": { routes: ["triplelift", "triplelift_s2s", "triplelift-s2s"] },
  "yieldmo.com": { routes: ["yieldmo", "yieldmo_s2s", "yieldmo-s2s"] },
};

function forceGlobalRouting(): void {
  Object.values(defaultEIDSources).forEach((source) => {
    source.routes = ["global"];
  });
}

// Helper function to get targeting data from cache
function targetingFromCache(config: RTDConfig = {} as RTDConfig): TargetingData | null {
  try {
    return JSON.parse(localStorage.getItem(config.optableCacheTargeting ?? "OPTABLE_RESOLVED") || "null");
  } catch (error) {
    config.log("error", "Failed to parse cached targeting data:", error);
    return null;
  }
}

// Get targeting data from cache, if available
async function readTargetingData(config: RTDConfig): Promise<TargetingData> {
  const cachedData = targetingFromCache(config);
  const cacheHasEids = (cachedData?.ortb2?.user?.eids?.length ?? 0) > 0;

  // Get auction delay from the configured Prebid global's config
  const prebid = (window as any)?.[config.prebidGlobal];
  const delay = prebid?.getConfig?.()?.realTimeData?.auctionDelay;

  // Return immediately when waitForTargeting is off, the cache already has
  // EIDs to serve, or no auction delay bounds a wait. A cache entry without
  // EIDs does not short-circuit: targeting may still be in flight.
  if (!config.waitForTargeting || cacheHasEids || !delay) {
    // Nothing bounds the wait, so this auction serves unenriched. Warn, since
    // that is indistinguishable from waitForTargeting being off.
    if (config.waitForTargeting && !cacheHasEids) {
      config.log(
        "warn",
        prebid
          ? `waitForTargeting is set but window.${config.prebidGlobal} reports no realTimeData.auctionDelay; serving this auction unenriched`
          : `waitForTargeting is set but window.${config.prebidGlobal} is not defined; serving this auction unenriched`
      );
    }

    if (!cachedData) {
      config.log("info", "No cached targeting data found");
      return {};
    }

    // Validate targeting data structure
    if (
      !cachedData?.ortb2?.user?.eids ||
      (!Array.isArray(cachedData?.ortb2?.user?.eids) && Object.keys(cachedData?.ortb2?.user ?? {}).length > 0)
    ) {
      config.log("info", "No valid targeting data found");
      return {};
    }

    config.log("info", `Found targeting data with ${cachedData.ortb2.user.eids.length} EIDs`);
    return cachedData;
  }

  // Cache is empty and delay is configured - wait for event or timeout
  config.log("info", `Waiting for targeting data (max ${delay}ms)`);

  const targetingData = await new Promise<TargetingData | null>((resolve) => {
    const eventHandler = () => {
      clearTimeout(timeoutId);
      config.log("info", "Received targeting update event");
      resolve(targetingFromCache(config));
    };

    const timeoutId = setTimeout(() => {
      window.removeEventListener(targetingEventName, eventHandler);
      config.log("warn", `Auction delay timeout (${delay}ms) - no targeting data available`);
      resolve(null);
    }, delay);

    window.addEventListener(targetingEventName, eventHandler, { once: true });
  });

  if (!targetingData) {
    config.log("info", "No targeting data available after waiting");
    return {};
  }

  // Validate targeting data structure
  if (!targetingData?.ortb2?.user?.eids || !Array.isArray(targetingData?.ortb2?.user?.eids)) {
    config.log("info", "No valid targeting data found");
    return {};
  }

  config.log("info", `Found targeting data with ${targetingData.ortb2.user.eids.length} EIDs after waiting`);
  return targetingData;
}

// The contextual response cached on the SDK instance named by config.instance.
function readContextualData(config: RTDConfig): ContextualSegmentsResponse | null {
  const sdk = (window as any)?.optable?.[config.instance];
  if (!sdk) {
    config.log("warn", `No SDK instance at window.optable.${config.instance} - serving no contextual data`);
    return null;
  }
  // An SDK build predating ctxSegmentsFromCache may share the page with this module.
  if (typeof sdk.ctxSegmentsFromCache !== "function") {
    config.log(
      "warn",
      `SDK at window.optable.${config.instance} lacks ctxSegmentsFromCache - serving no contextual data`
    );
    return null;
  }
  return sdk.ctxSegmentsFromCache();
}

// Our keywords missing from theirs, comparing trimmed and ignoring case.
function missingKeywords(theirs: unknown[], ours: string[]): string[] {
  const seen = new Set(
    theirs.filter((kw): kw is string => typeof kw === "string").map((kw) => kw.trim().toLowerCase())
  );
  return ours.filter((kw) => {
    const key = kw.trim().toLowerCase();
    if (!key || seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

// Merges the contextual fragment into the target site, replacing only what
// Optable owns: our site.content.data entries.
function mergeContextual(config: RTDConfig, targetORTB2: ORTB2, response: ContextualSegmentsResponse): void {
  const { site } = ContextualPrebidORTB2(response);
  const ours = site.content.keywords ? site.content.keywords.split(",") : [];
  const hasStaleData = (targetORTB2.site?.content?.data ?? []).some((d) => d?.name === CONTEXTUAL_DATA_NAME);
  if (!site.content.data.length && !ours.length && !hasStaleData) {
    return;
  }

  targetORTB2.site = targetORTB2.site ?? {};
  const content = (targetORTB2.site.content = targetORTB2.site.content ?? {});
  if (site.content.data.length || hasStaleData) {
    content.data = [...(content.data ?? []).filter((d) => d?.name !== CONTEXTUAL_DATA_NAME), ...site.content.data];
  }
  let added = 0;
  if (ours.length) {
    // Drop trailing separators so the join leaves no empty keyword; the rest stays as the publisher set it.
    const theirs = typeof content.keywords === "string" ? content.keywords.replace(/(^|,)[\s,]*$/, "") : "";
    const missing = missingKeywords(theirs.split(","), ours);
    added = missing.length;
    content.keywords = [...(theirs.trim() ? [theirs] : []), ...missing].join(",");
    // Also join the publisher's kwarray, so adapters reading either field see our keywords.
    if (Array.isArray(content.kwarray)) {
      content.kwarray = [...content.kwarray, ...missingKeywords(content.kwarray, ours)];
    }
  }

  config.log("info", `Merged contextual data: ${site.content.data.length} segment set(s), ${added} keyword(s)`);
}

function mergeStrategy(config: RTDConfig, eidSource: string): MergeStrategy {
  const strategy = config.eidSources[eidSource]?.mergeStrategy || config.mergeStrategy;
  if (strategy) {
    return strategy;
  }

  config.log("warn", `No merge strategy defined globally or for EID source: ${eidSource}. Using append.`);
  return appendMergeStrategy;
}

function merge(config: RTDConfig, targetORTB2: ORTB2, sourceORTB2: ORTB2): number {
  /* eslint-disable no-param-reassign */
  targetORTB2.user = targetORTB2.user ?? {};
  targetORTB2.user.ext = targetORTB2.user.ext ?? {};
  /* eslint-enable no-param-reassign */

  // Use Object.getOwnPropertyDescriptor/defineProperty to bypass Prebid's ORTB2
  // Proxy whose get trap blocks direct reads of `eids`.
  const eidsDesc = Object.getOwnPropertyDescriptor(targetORTB2.user.ext, "eids");
  let currentEids: EID[] = Array.isArray(eidsDesc?.value) ? eidsDesc.value : [];
  let skipped = 0;

  const eidsBySource =
    sourceORTB2.user?.ext?.eids?.reduce((acc: { [source: string]: EID[] }, eid) => {
      acc[eid.source] = acc[eid.source] ?? [];
      acc[eid.source].push(eid);
      return acc;
    }, {}) || {};

  Object.entries(eidsBySource).forEach(([eidSource, eids]) => {
    if (config.skipMerge(targetORTB2, eidSource)) {
      skipped += 1;
      return;
    }

    const mergeFn = mergeStrategy(config, eidSource);
    currentEids = mergeFn(currentEids, eids);
  });

  Object.defineProperty(targetORTB2.user!.ext!, "eids", {
    value: currentEids,
    writable: true,
    enumerable: true,
    configurable: true,
  });
  return skipped;
}

// Custom handleRtd function to merge targeting data into the reqBidsConfigObj
function handleRtd(
  config: RTDConfig,
  reqBidsConfigObj: ReqBidsConfigObj,
  targetingData: TargetingData,
  _optableExtraData?: any,
  _mergeFn?: any
): void {
  config.log("info", "Starting handleRtd function");

  // Filter EIDs for global ORTB2 and collect bidder-specific EIDs
  const eidsPerRoute: { [route: string]: ORTB2 } = {};
  let processedEids = 0;
  let skippedEids = 0;

  config.log("info", "targetingData", targetingData);

  targetingData?.ortb2?.user?.eids?.forEach((eid, index) => {
    if (!eid || typeof eid !== "object") {
      config.log("warn", `Skipping invalid EID at index ${index}:`, eid);
      skippedEids += 1;
      return;
    }

    // Apply matcher filter
    if (config.matcherFilter.length > 0 && !config.matcherFilter.includes(eid.matcher || "")) {
      config.log("info", `EID with source ${eid.source} filtered out by matcher filter (matcher: ${eid.matcher})`);
      skippedEids += 1;
      return;
    }

    // Apply matcher exclusions
    if (config.matcherExclude.length > 0 && config.matcherExclude.includes(eid.matcher || "")) {
      config.log("info", `EID with source ${eid.source} excluded (matcher: ${eid.matcher})`);
      skippedEids += 1;
      return;
    }

    const eidSourceConfig = config.eidSources[eid.source];
    const routes = eidSourceConfig?.routes ?? (eidSourceConfig?.route ? [eidSourceConfig.route] : ["global"]);
    if (!routes || !Array.isArray(routes) || routes.length === 0) {
      config.log("warn", `EID with source ${eid.source} has no supported routes`);
      skippedEids += 1;
      return;
    }

    routes.forEach((route) => {
      eidsPerRoute[route] = eidsPerRoute[route] ?? { user: { ext: { eids: [] } } };
      const { _ref, ...clean } = eid as any;
      eidsPerRoute[route].user!.ext!.eids!.push(clean);
      config.log("info", `EID with source ${eid.source} routed to ${route}`);
    });
    processedEids += 1;
  });

  let globalEidsCount = 0;
  let bidderEidsCount = 0;

  Object.entries(eidsPerRoute).forEach(([route, ortb2]) => {
    const count = ortb2.user?.ext?.eids?.length || 0;
    if (route === "global") {
      globalEidsCount += count;
      skippedEids += merge(config, reqBidsConfigObj.ortb2Fragments.global, ortb2);
    } else if (route in reqBidsConfigObj.ortb2Fragments.bidder) {
      bidderEidsCount += count;
      skippedEids += merge(config, reqBidsConfigObj.ortb2Fragments.bidder[route], ortb2);
    } else {
      config.log("info", `Bidder "${route}" not in auction, routing ${count} EID(s) to global`);
      globalEidsCount += count;
      skippedEids += merge(config, reqBidsConfigObj.ortb2Fragments.global, ortb2);
    }
  });

  config.log("info", `Processed ${processedEids} EIDs, skipped ${skippedEids} EIDs`);
  config.log("info", `Merged ${globalEidsCount} global EIDs and ${bidderEidsCount} bidder-specific EID sets`);
  config.log("info", "Successfully completed handleRtd function");
}

// @ts-ignore
function liveIntentUID2(ortb2: ORTB2): boolean {
  return (
    ortb2.user?.ext?.eids?.some(
      (eid) => eid.source === "uidapi.com" && eid.uids.some((uid) => uid.ext?.provider === "liveintent.com")
    ) || false
  );
}

function buildRTD(options: RTDOptions = {}): RTDConfig {
  if (flagEnabled("optableForceGlobalRouting") || options.forceGlobalRouting) {
    forceGlobalRouting();
  }

  return {
    enableLogging: flagEnabled("optableDebug") || (options.enableLogging ?? false),
    log(level: string, message: string, ...args: any[]) {
      if (this.enableLogging) {
        consoleLog("Optable RTD:", level, message, ...args);
      }
    },
    eidSources: options.eidSources ?? { ...defaultEIDSources },
    skipMerge: flagEnabled("optableForceSkipMerge")
      ? () => true
      : options.skipMerge !== undefined
        ? options.skipMerge
        : () => false,
    optableCacheTargeting: options.optableCacheTargeting ?? "OPTABLE_RESOLVED",
    matcherFilter: options.matcherFilter ?? [],
    matcherExclude: options.matcherExclude ?? [],
    mergeStrategy: options.mergeStrategy,
    appendMergeStrategy,
    prependMergeStrategy,
    replaceMergeStrategy,
    appendNewMergeStrategy,
    targetingFromCache,
    instance: options.instance ?? "instance",
    prebidGlobal: options.prebidGlobal ?? "pbjs",
    waitForTargeting: options.waitForTargeting ?? false,
    enableContextual: options.enableContextual ?? (() => false),
    isControlGroup: options.isControlGroup ?? (() => false),
    async handleRtd(reqBidsConfigObj: ReqBidsConfigObj, optableExtraData?: any, mergeFn?: any): Promise<void | null> {
      const applyContextual = () => {
        try {
          const contextualData = this.enableContextual() ? readContextualData(this) : null;
          if (contextualData) {
            mergeContextual(this, reqBidsConfigObj.ortb2Fragments.global, contextualData);
          }
        } catch (error) {
          this.log("error", "Failed to merge contextual data:", error);
        }
      };

      if (this.isControlGroup()) {
        applyContextual();
        this.log("info", "Control group - serving no EIDs");
        return null;
      }
      const targetingData = options.targetingData ?? (await readTargetingData(this));
      // Read after the targeting wait so a ctxSegments() response that lands during it is used.
      applyContextual();
      try {
        return handleRtd(this, reqBidsConfigObj, targetingData, optableExtraData, mergeFn);
      } catch (error) {
        this.log("error", "Unexpected error in handleRtd function:", error);
      }
      return null;
    },
  };
}

export {
  buildRTD,
  targetingFromCache,
  appendMergeStrategy,
  prependMergeStrategy,
  replaceMergeStrategy,
  appendNewMergeStrategy,
  defaultEIDSources,
  type EID,
  type EIDSource,
  type ORTB2,
  type ORTB2User,
  type ORTB2Site,
  type TargetingData,
  type ReqBidsConfigObj,
  type RTDConfig,
  type RTDOptions,
  type MergeStrategy,
};
