// RTD (Real-Time Data) module for Prebid.js integration
import { targetingEventName } from "../events/cache-refresh";
import { flagEnabled } from "../flags";
import { consoleLog } from "../log";

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

// Per-auction routing rule, applied on top of eidSources. See rtd.md.
interface EIDRule {
  // Substring(s) matched against the EID source. Omitted: every source.
  sources?: string | string[];
  // Substrings matched against EID sources other providers already put in the
  // auction's global ORTB2. Omitted: the rule applies to every auction.
  when?: {
    sourcePresent?: string;
    sourceAbsent?: string;
  };
  // Replace the working set of bidders.
  routes?: string[];
  // Add bidders to the working set.
  include?: string[];
  // Remove bidders from the working set, including their -s2s / _s2s aliases.
  exclude?: string[];
}

interface ORTB2User {
  eids?: EID[];
  ext?: {
    eids?: EID[];
  };
}

interface ORTB2 {
  user?: ORTB2User;
}

interface TargetingData {
  ortb2?: {
    user?: {
      eids?: EID[];
    };
  };
}

interface ReqBidsConfigObj {
  adUnits?: Array<{ bids?: Array<{ bidder?: string }> }>;
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
  eidRules: EIDRule[];
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
  isControlGroup: () => boolean;
}

interface RTDOptions {
  enableLogging?: boolean;
  eidSources?: { [source: string]: EIDSource };
  // Ordered per-auction routing rules applied on top of eidSources.
  eidRules?: EIDRule[];
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
  // Split-test gate: while it returns true, handleRtd serves no EIDs. Wired
  // to the wrapper's assignment (for example setupAB's result).
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

const S2S_ALIAS = /[-_]s2s$/;

// Reads EIDs past Prebid's ORTB2 Proxy, whose get trap blocks direct reads of `eids`.
function readEids(ortb2?: ORTB2): EID[] {
  const ext = ortb2?.user?.ext;
  const eids = ext ? Object.getOwnPropertyDescriptor(ext, "eids")?.value : null;
  return Array.isArray(eids) ? eids : [];
}

// Bidders in this auction: adUnit bids plus s2sConfig bidders, which reach
// Prebid Server through ortb2Fragments.bidder and so need routing too.
function auctionBidders(config: RTDConfig, reqBidsConfigObj: ReqBidsConfigObj): string[] {
  const bidders = new Set<string>();
  reqBidsConfigObj.adUnits?.forEach((adUnit) =>
    adUnit.bids?.forEach((bid) => {
      if (bid.bidder) bidders.add(bid.bidder);
    })
  );
  const s2sConfig = (window as any)?.[config.prebidGlobal]?.getConfig?.("s2sConfig");
  (Array.isArray(s2sConfig) ? s2sConfig : [s2sConfig]).forEach((s2s) =>
    s2s?.bidders?.forEach((bidder: string) => bidders.add(bidder))
  );
  return [...bidders];
}

function ruleMatchesAuction(rule: EIDRule, auctionSources: string[]): boolean {
  const present = (needle: string) => auctionSources.some((source) => source.includes(needle));
  if (rule.when?.sourcePresent && !present(rule.when.sourcePresent)) return false;
  if (rule.when?.sourceAbsent && present(rule.when.sourceAbsent)) return false;
  return true;
}

function ruleCoversSource(rule: EIDRule, source: string): boolean {
  if (!rule.sources) return true;
  const needles = Array.isArray(rule.sources) ? rule.sources : [rule.sources];
  return needles.some((needle) => source.includes(needle));
}

// Applies config.eidRules to this auction. Returns, per source the rules
// narrowed, the bidders in the auction that receive it (possibly none).
// Sources the rules leave alone are absent and keep their eidSources routing.
function routesFromRules(
  config: RTDConfig,
  reqBidsConfigObj: ReqBidsConfigObj,
  sources: string[]
): { [source: string]: string[] } {
  if (!config.eidRules?.length) return {};

  // Conditions look at what other providers resolved, not at our own EIDs
  // (for example ones already merged through pubProvidedId).
  const auctionSources = readEids(reqBidsConfigObj.ortb2Fragments.global)
    .filter((eid) => (eid as any).inserter !== "optable.co")
    .map((eid) => eid.source || "");
  const active = config.eidRules.filter((rule) => ruleMatchesAuction(rule, auctionSources));
  if (!active.length) {
    config.log("info", "No EID rule matches this auction");
    return {};
  }

  const candidates = auctionBidders(config, reqBidsConfigObj);
  if (!candidates.length) {
    config.log("warn", "EID rules match but no bidders were found in the auction; routing unchanged");
    return {};
  }

  const scoped: { [source: string]: string[] } = {};
  sources.forEach((source) => {
    const base = config.eidSources[source];
    const baseRoutes = base?.routes ?? (base?.route ? [base.route] : ["global"]);
    const wasGlobal = baseRoutes.includes("global");
    let set = wasGlobal ? candidates : baseRoutes;
    let touched = false;

    active
      .filter((rule) => ruleCoversSource(rule, source))
      .forEach((rule) => {
        if (rule.routes) {
          set = rule.routes.includes("global") ? candidates : [...rule.routes];
          touched = true;
        }
        if (rule.include) {
          set = [...new Set([...set, ...rule.include])];
          touched = true;
        }
        if (rule.exclude) {
          const excluded = rule.exclude;
          set = set.filter((bidder) => !excluded.includes(bidder) && !excluded.includes(bidder.replace(S2S_ALIAS, "")));
          touched = true;
        }
      });

    if (!touched) return;
    const routes = set.filter((bidder) => candidates.includes(bidder));
    // Still everyone: stay global rather than fan out into identical per-bidder copies.
    if (wasGlobal && routes.length === candidates.length) return;

    scoped[source] = routes;
    const withheld = (wasGlobal ? candidates : baseRoutes).filter((bidder) => !routes.includes(bidder));
    config.log("info", `EID rules route ${source} to [${routes}], withheld from [${withheld}]`);
  });
  return scoped;
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
  // EIDs whose source an EID rule narrowed: delivered only to those bidders.
  const ruleEidsPerRoute: { [route: string]: ORTB2 } = {};
  let processedEids = 0;
  let skippedEids = 0;

  config.log("info", "targetingData", targetingData);

  const sources = [
    ...new Set((targetingData?.ortb2?.user?.eids ?? []).map((eid) => eid?.source).filter(Boolean)),
  ] as string[];
  const ruleRoutes = routesFromRules(config, reqBidsConfigObj, sources);

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

    const ruleRouted = ruleRoutes[eid.source];
    if (ruleRouted) {
      if (!ruleRouted.length) {
        config.log("info", `EID with source ${eid.source} withheld from every bidder by EID rules`);
        skippedEids += 1;
        return;
      }
      const { _ref, ...clean } = eid as any;
      ruleRouted.forEach((route) => {
        ruleEidsPerRoute[route] = ruleEidsPerRoute[route] ?? { user: { ext: { eids: [] } } };
        ruleEidsPerRoute[route].user!.ext!.eids!.push(clean);
      });
      processedEids += 1;
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

  // Rule routes only name bidders in this auction, and must never fall back to
  // global (that would hand the EID to the bidders a rule withheld it from), so
  // the bidder's fragment is created when Prebid has none. Runs after the loop
  // above so creating a fragment here does not change where other sources go.
  Object.entries(ruleEidsPerRoute).forEach(([route, ortb2]) => {
    const fragments = reqBidsConfigObj.ortb2Fragments.bidder;
    fragments[route] = fragments[route] ?? {};
    bidderEidsCount += ortb2.user?.ext?.eids?.length || 0;
    skippedEids += merge(config, fragments[route], ortb2);
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
    eidRules: options.eidRules ?? [],
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
    isControlGroup: options.isControlGroup ?? (() => false),
    async handleRtd(reqBidsConfigObj: ReqBidsConfigObj, optableExtraData?: any, mergeFn?: any): Promise<void | null> {
      if (this.isControlGroup()) {
        this.log("info", "Control group - serving no EIDs");
        return null;
      }
      const targetingData = options.targetingData ?? (await readTargetingData(this));
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
  type EIDRule,
  type ORTB2,
  type ORTB2User,
  type TargetingData,
  type ReqBidsConfigObj,
  type RTDConfig,
  type RTDOptions,
  type MergeStrategy,
};
