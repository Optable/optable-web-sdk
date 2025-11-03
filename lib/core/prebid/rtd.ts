// RTD (Real-Time Data) module for Prebid.js integration

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
  handleRtd: (reqBidsConfigObj: ReqBidsConfigObj) => Promise<void | null>;
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

// Simple logging utility
function log(level: string, message: string, ...args: any[]): void {
  const prefix = "Optable RTD:";

  const logMethod = ["error", "warn", "info"].includes(level) ? level : "log";
  (console as any)[logMethod](`${prefix} ${message}`, ...args); // eslint-disable-line no-console
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
function readTargetingData(config: RTDConfig): TargetingData {
  const cachedData = targetingFromCache(config);
  if (!cachedData) {
    config.log("info", "No cached targeting data found");
    return {};
  }

  let targetingData = cachedData;

  // Validate targeting data structure
  if (!targetingData?.ortb2?.user?.eids || !Array.isArray(targetingData?.ortb2?.user?.eids)) {
    config.log("info", "No valid targeting data found");
    return {};
  }

  config.log("info", `Found targeting data with ${targetingData.ortb2.user.eids.length} EIDs`);
  return targetingData;
}

function mergeStrategy(config: RTDConfig, eidSource: string): MergeStrategy {
  const strategy = config.eidSources[eidSource]?.mergeStrategy || config.mergeStrategy;
  if (strategy) {
    return strategy;
  }

  config.log("warn", `No merge strategy defined globally or for EID source: ${eidSource}. Using append.`);
  return appendNewMergeStrategy;
}

function merge(config: RTDConfig, targetORTB2: ORTB2, sourceORTB2: ORTB2): number {
  /* eslint-disable no-param-reassign */
  targetORTB2.user = targetORTB2.user ?? {};
  targetORTB2.user.ext = targetORTB2.user.ext ?? {};
  targetORTB2.user.ext.eids = targetORTB2.user.ext.eids ?? [];
  /* eslint-enable no-param-reassign */
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
    // eslint-disable-next-line no-param-reassign
    targetORTB2.user!.ext!.eids = mergeFn(targetORTB2.user!.ext!.eids!, eids);
  });
  return skipped;
}

// Custom handleRtd function to merge targeting data into the reqBidsConfigObj
function handleRtd(config: RTDConfig, reqBidsConfigObj: ReqBidsConfigObj, targetingData: TargetingData): void {
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
      eidsPerRoute[route].user!.ext!.eids!.push(eid);
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
    } else {
      bidderEidsCount += count;
      const bidder = reqBidsConfigObj.ortb2Fragments.bidder[route] ?? {};
      skippedEids += merge(config, bidder, ortb2);
      // eslint-disable-next-line no-param-reassign
      reqBidsConfigObj.ortb2Fragments.bidder[route] = bidder;
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
  if (sessionStorage.optableForceGlobalRouting || options.forceGlobalRouting) {
    forceGlobalRouting();
  }

  return {
    enableLogging: sessionStorage.optableDebug ?? options.enableLogging ?? false,
    log(level: string, message: string, ...args: any[]) {
      if (this.enableLogging) {
        log(level, message, ...args);
      }
    },
    eidSources: options.eidSources ?? { ...defaultEIDSources },
    skipMerge: sessionStorage.optableForceSkipMerge
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
    async handleRtd(reqBidsConfigObj: ReqBidsConfigObj): Promise<void | null> {
      const targetingData = options.targetingData ?? readTargetingData(this);
      try {
        return handleRtd(this, reqBidsConfigObj, targetingData);
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
  type TargetingData,
  type ReqBidsConfigObj,
  type RTDConfig,
  type RTDOptions,
  type MergeStrategy,
};
