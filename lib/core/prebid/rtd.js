// RTD (Real-Time Data) module for Prebid.js integration
//
// Merge strategies for EIDs
function appendMergeStrategy(existingEids, newEids) {
  return [...existingEids, ...newEids];
}

function prependMergeStrategy(existingEids, newEids) {
  return [...newEids, ...existingEids];
}

function replaceMergeStrategy(existingEids, newEids, key = (e) => e.source) {
  const existingByKey = existingEids.reduce((acc, eid) => {
    acc[key(eid)] = acc[key(eid)] ?? [];
    acc[key(eid)].push(eid);
    return acc;
  }, {});

  const newByKey = newEids.reduce((acc, eid) => {
    acc[key(eid)] = acc[key(eid)] ?? [];
    acc[key(eid)].push(eid);
    return acc;
  }, {});

  const result = Object.values({ ...existingByKey, ...newByKey });
  return result.flat();
}

function appendNewMergeStrategy(existingEids, newEids, key = (e) => e.source) {
  const existingByKey = existingEids.reduce((acc, eid) => {
    acc[key(eid)] = acc[key(eid)] ?? [];
    acc[key(eid)].push(eid);
    return acc;
  }, {});

  const newByKey = newEids.reduce((acc, eid) => {
    acc[key(eid)] = acc[key(eid)] ?? [];
    acc[key(eid)].push(eid);
    return acc;
  }, {});

  const result = Object.values({ ...newByKey, ...existingByKey });
  return result.flat();
}

const defaultEIDSources = {
  "adnxs.com": { routes: ["appnexus"] },
  "adsrvr.org": { routes: ["global"] },
  "adserver.org": { routes: ["global"] },
  "audigent.com": { routes: ["global"] },
  "bidswitch.net": { routes: ["global"] },
  "bridge.criteo.com": { routes: ["global"] },
  "criteo-hemapi.com": { routes: ["global"] },
  "epsilon.com": { routes: ["global"] },
  "gumgum.com": { routes: ["gumgum"] },
  "indexexchange.com": { routes: ["ix"] },
  "kargo.com": { routes: ["kargo"] },
  "openx.com": { routes: ["openx"] },
  "pubmatic.com": { routes: ["pubmatic"] },
  "rubiconproject.com": { routes: ["rubicon"] },
  "smartadserver.com": { routes: ["smartadserver"] },
  "sovrn.com": { routes: ["sovrn"] },
  "triplelift.com": { routes: ["triplelift"] },
  "uidapi.com": { routes: ["global"] },
  "yahoo.com": { routes: ["global"] },
  "yieldmo.com": { routes: ["yieldmo"] },
};

function forceGlobalRouting() {
  Object.values(defaultEIDSources).forEach((source) => {
    source.routes = ["global"];
  });
}

// Simple logging utility
function log(level, message, ...args) {
  const prefix = "Optable RTD:";

  const logMethod = ["error", "warn", "info"].includes(level) ? level : "log";
  console[logMethod](`${prefix} ${message}`, ...args); // eslint-disable-line no-console
}

// Helper function to get targeting data from cache
function targetingFromCache(config = {}) {
  try {
    return JSON.parse(localStorage.getItem(config.optableCacheTargeting ?? "OPTABLE_RESOLVED"));
  } catch (error) {
    config.log("error", "Failed to parse cached targeting data:", error);
    return null;
  }
}

// Get targeting data from cache, if available
function readTargetingData(config) {
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

function mergeStrategy(config, eidSource) {
  const strategy = config.eidSources[eidSource]?.mergeStrategy || config.mergeStrategy;
  if (strategy) {
    return strategy;
  }

  config.log("warn", `No merge strategy defined globally or for EID source: ${eidSource}. Using append.`);
  return appendMergeStrategy;
}

function merge(config, targetORTB2, sourceORTB2) {
  /* eslint-disable no-param-reassign */
  targetORTB2.user = targetORTB2.user ?? {};
  targetORTB2.user.ext = targetORTB2.user.ext ?? {};
  targetORTB2.user.ext.eids = targetORTB2.user.ext.eids ?? [];
  /* eslint-enable no-param-reassign */
  let skipped = 0;

  const eidsBySource = sourceORTB2.user.ext.eids.reduce((acc, eid) => {
    acc[eid.source] = acc[eid.source] ?? [];
    acc[eid.source].push(eid);
    return acc;
  }, {});

  Object.entries(eidsBySource).forEach(([eidSource, eids]) => {
    if (config.skipMerge(targetORTB2, eidSource)) {
      skipped += 1;
      return;
    }

    const mergeFn = mergeStrategy(config, eidSource);
    // eslint-disable-next-line no-param-reassign
    targetORTB2.user.ext.eids = mergeFn(targetORTB2.user.ext.eids, eids);
  });
  return skipped;
}

// Custom handleRtd function to merge targeting data into the reqBidsConfigObj
function handleRtd(config, reqBidsConfigObj, targetingData) {
  config.log("info", "Starting handleRtd function");

  // Filter EIDs for global ORTB2 and collect bidder-specific EIDs
  const eidsPerRoute = {};
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
    if (config.matcherFilter.length > 0 && !config.matcherFilter.includes(eid.matcher)) {
      config.log("info", `EID with source ${eid.source} filtered out by matcher filter (matcher: ${eid.matcher})`);
      skippedEids += 1;
      return;
    }

    // Apply matcher exclusions
    if (config.matcherExclude.length > 0 && config.matcherExclude.includes(eid.matcher)) {
      config.log("info", `EID with source ${eid.source} excluded (matcher: ${eid.matcher})`);
      skippedEids += 1;
      return;
    }

    const eidSourceConfig = config.eidSources[eid.source];
    const routes = eidSourceConfig?.routes ?? (eidSourceConfig?.route ? [eidSourceConfig.route] : null);
    if (!routes || !Array.isArray(routes) || routes.length === 0) {
      config.log("warn", `EID with source ${eid.source} has no supported routes`);
      skippedEids += 1;
      return;
    }

    routes.forEach((route) => {
      eidsPerRoute[route] = eidsPerRoute[route] ?? { user: { ext: { eids: [] } } };
      eidsPerRoute[route].user.ext.eids.push(eid);
      config.log("info", `EID with source ${eid.source} routed to ${route}`);
    });
    processedEids += 1;
  });

  let globalEidsCount = 0;
  let bidderEidsCount = 0;

  Object.entries(eidsPerRoute).forEach(([route, ortb2]) => {
    const count = ortb2.user.ext.eids.length;
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

function liveIntentUID2(ortb2) {
  return ortb2.user?.ext?.eids?.some(
    (eid) => eid.source === "uidapi.com" && eid.uids.some((uid) => uid.ext?.provider === "liveintent.com")
  );
}

function buildRTD(options = {}) {
  if (sessionStorage.optableForceGlobalRouting || options.forceGlobalRouting) {
    forceGlobalRouting();
  }

  return {
    enableLogging: sessionStorage.optableDebug ?? options.enableLogging ?? false,
    log(...args) {
      if (this.enableLogging) {
        log(...args);
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
    appendMergeStrategy,
    prependMergeStrategy,
    replaceMergeStrategy,
    appendNewMergeStrategy,
    targetingFromCache,
    async handleRtd(reqBidsConfigObj) {
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
};
