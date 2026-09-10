import { debugLog } from "../log";

// Delivers cached EIDs to prebid through the pubProvidedId user-id submodule,
// for integrations that don't use the RTD module.

type Eid = {
  source: string;
  uids?: unknown[];
};

type PubProvidedIdOptions = {
  // Prebid global names to merge into. Defaults to ["pbjs"].
  instances?: readonly string[];
  // localStorage key of the EID cache. Defaults to OPTABLE_RESOLVED.
  cacheKey?: string;
  // EIDs to merge, bypassing the cache read.
  eids?: Eid[];
  // Refresh every user-id submodule after merging, not just pubProvidedId.
  // Workaround for prebid/Prebid.js#15562 — see pubProvidedId.md.
  refreshAll?: boolean;
};

const DEFAULT_CACHE_KEY = "OPTABLE_RESOLVED";

function cachedEids(cacheKey: string): Eid[] {
  try {
    const resolved = JSON.parse(localStorage.getItem(cacheKey) || "null");
    return resolved?.ortb2?.user?.eids || [];
  } catch {
    return [];
  }
}

// Cache sidecars like _ref (UID2 refresh material) must not reach bid requests.
function stripSidecars(eid: Eid): Eid {
  const clean: Record<string, unknown> = {};
  for (const key of Object.keys(eid)) {
    if (!key.startsWith("_")) {
      clean[key] = (eid as Record<string, unknown>)[key];
    }
  }
  return clean as Eid;
}

export function mergeIntoPubProvidedId(options: PubProvidedIdOptions = {}): void {
  const instances = options.instances ?? ["pbjs"];
  const ourEids = (options.eids ?? cachedEids(options.cacheKey ?? DEFAULT_CACHE_KEY)).map(stripSidecars);

  instances.forEach((instanceName) => {
    if (!ourEids.length) {
      debugLog("log", `(${instanceName}) PPID: no EIDs to merge`);
      return;
    }

    // Queue on the named global so this also works before prebid has loaded.
    const w = window as unknown as Record<string, { que?: Array<() => void> } & Record<string, any>>;
    w[instanceName] = w[instanceName] || {};
    const pbjs = w[instanceName];
    pbjs.que = pbjs.que || [];
    pbjs.que.push(() => {
      try {
        const ourSources = new Set(ourEids.map((e) => e.source));

        // Collapse every pubProvidedId entry found, not just the first, so a
        // config already polluted with duplicates heals back down to one.
        const currentUserSync = pbjs.getConfig?.("userSync") || {};
        const currentUserIds: Array<{ name?: string; params?: { eids?: Eid[] } }> = currentUserSync.userIds || [];
        const existingEids = currentUserIds
          .filter((u) => u.name === "pubProvidedId")
          .flatMap((u) => u.params?.eids || []);

        // Keep EIDs from other providers, replace ours by source.
        const preserved = existingEids.filter((e) => !ourSources.has(e.source));
        const mergedEids = [...preserved, ...ourEids];

        const updatedUserIds = currentUserIds.filter((u) => u.name !== "pubProvidedId");
        updatedUserIds.push({
          name: "pubProvidedId",
          params: { eids: mergedEids },
        });

        pbjs.setConfig?.({ userSync: { ...currentUserSync, userIds: updatedUserIds } });
        if (options.refreshAll) {
          pbjs.refreshUserIds?.();
        } else {
          pbjs.refreshUserIds?.({ submoduleNames: ["pubProvidedId"] });
        }
        debugLog(
          "log",
          `(${instanceName}) PPID: merged ${ourEids.length} EIDs (${preserved.length} preserved from others)`
        );
      } catch (err) {
        debugLog("error", `(${instanceName}) PPID: merge error`, err);
      }
    });
  });
}

export type { Eid, PubProvidedIdOptions };
