import { withoutLegacyRef } from "../eid-cache";
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
  // Workaround for prebid/Prebid.js#15562; see pubProvidedId.md.
  refreshAll?: boolean;
  // Split-test gate, same shape as buildRTD's: while it returns true, nothing
  // is delivered. Checked per call, since a wrapper merges from several places.
  isControlGroup?: () => boolean;
};

const DEFAULT_CACHE_KEY = "OPTABLE_RESOLVED";
// Marks the prebid global whose ID vendors have had their one unfiltered
// refresh. Per instance, and per page since the global is.
const REFRESHED_ALL_KEY = "__optableRefreshedAllUserIds";

function cachedEids(cacheKey: string): Eid[] {
  try {
    const resolved = JSON.parse(localStorage.getItem(cacheKey) || "null");
    return resolved?.ortb2?.user?.eids || [];
  } catch {
    return [];
  }
}

export function mergeIntoPubProvidedId(options: PubProvidedIdOptions = {}): void {
  if (options.isControlGroup?.()) {
    debugLog("log", "PPID: control group, delivering nothing");
    return;
  }

  const instances = options.instances ?? ["pbjs"];
  // A cache written by an older wrapper still carries _ref until this SDK
  // rewrites it, and the first merge can run before that happens.
  const ourEids = (options.eids ?? cachedEids(options.cacheKey ?? DEFAULT_CACHE_KEY)).map(withoutLegacyRef);

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

        // A wrapper merges on every cache write, so the filtered refresh runs
        // each time to propagate the new EIDs. The unfiltered one runs once:
        // it only exists to survive submodule initialization, and repeating it
        // re-requests every ID vendor again.
        if (options.refreshAll && !pbjs[REFRESHED_ALL_KEY]) {
          pbjs[REFRESHED_ALL_KEY] = true;
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
