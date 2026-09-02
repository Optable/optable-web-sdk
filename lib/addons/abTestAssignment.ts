import type { ABTestConfig } from "../config";
import { determineABTest } from "../edge/abTest";
import { getFlags } from "../core/flags";

const DEFAULT_STORAGE_KEY = "OPTABLE_SPLIT_TEST";

// A variant is an ABTestConfig whose trafficPercentage may be omitted and
// inferred. The edge-facing fields (skipMatchers, skipResolvers,
// matcher_override) are carried through untouched, so a caller can attach them
// to one arm and hand the selected variant straight to InitConfig.abTests.
export type ABTestVariant = Omit<ABTestConfig, "trafficPercentage"> & {
  trafficPercentage?: number;
};

export interface SetupABConfig {
  variants: ABTestVariant[];
  storageKey?: string;
  // The variant id treated as "control" (Optable disabled). Defaults to 'test'.
  controlId?: string;
  // The variant id treated as "treatment" (Optable enabled). Defaults to 'production'.
  treatmentId?: string;
  // An initialized SDK instance. When provided, targetingClearCache() is used
  // for precise cache clearing in the control group instead of a prefix scan.
  sdk?: { targetingClearCache: () => void };
  // A Prebid.js instance. When provided, bid stamping hooks are registered automatically.
  pbjs?: any;
}

export interface ABTestSetupResult {
  variant: ABTestConfig;
  isControl: boolean;
  splitTestAssignment: string;
  // For deferred hook registration when pbjs is not yet available at setup time.
  setHooks: (pbjs: any) => void;
}

function fillTrafficPercentages(variants: ABTestVariant[]): ABTestConfig[] {
  const allocated = variants.reduce((sum, v) => sum + (v.trafficPercentage ?? 0), 0);
  const unassigned = variants.filter((v) => v.trafficPercentage === undefined);
  const each = unassigned.length > 0 ? (100 - allocated) / unassigned.length : 0;
  return variants.map((v) => ({
    ...v,
    trafficPercentage: v.trafficPercentage ?? each,
  }));
}

export function setupAB(config: SetupABConfig): ABTestSetupResult {
  const {
    variants,
    storageKey = DEFAULT_STORAGE_KEY,
    controlId = "test",
    treatmentId = "production",
    sdk,
    pbjs,
  } = config;

  // Process the provided variant config so that every variant has an explicit traffic percentage.
  // Variants without one share the remaining percentage equally.
  const filled = fillTrafficPercentages(variants);

  let selected: ABTestConfig | null = null;

  // Priority 1 — QA/debug override naming a variant directly.
  // ?optableSplitTest=<id> forces that arm. optableControlGroup only reaches the
  // two arms named by controlId and treatmentId, so this is the only way to hold
  // a third arm in a multi-variant test. Unknown ids fall through to the normal
  // resolution rather than inventing a variant.
  const splitTestFlag = getFlags().optableSplitTest;
  if (splitTestFlag) {
    selected = filled.find((v) => v.id === splitTestFlag) ?? null;
  }

  // Priority 2 — QA/debug override via URL param or sessionStorage flag.
  // ?optableControlGroup=1 forces the control variant; =0 forces treatment.
  // This lets QA verify both branches without clearing localStorage.
  const controlGroupFlag = getFlags().optableControlGroup;
  if (!selected && controlGroupFlag === "1") {
    selected = filled.find((v) => v.id === controlId) ?? { id: controlId, trafficPercentage: 0 };
  } else if (!selected && controlGroupFlag === "0") {
    selected = filled.find((v) => v.id === treatmentId) ?? { id: treatmentId, trafficPercentage: 0 };
  }

  // Priority 3 — sticky assignment from a previous visit.
  // Once a user is assigned a variant it must not change across page loads or
  // sessions, otherwise the same user could appear in both groups. We validate
  // the cached id against the current variant list so a stale cache from an
  // old experiment config is silently discarded.
  //
  // Only the id is taken from storage. Everything else comes from the current
  // variant config, so editing an arm's skipMatchers (or its weight) applies to
  // users who were already assigned to it instead of only to new ones.
  if (!selected) {
    try {
      const cached = localStorage.getItem(storageKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        selected = filled.find((v) => v.id === parsed?.id) ?? null;
      }
    } catch {
      // localStorage unavailable or invalid JSON
    }
  }

  // Priority 4 — first visit: randomly assign based on traffic weights.
  // determineABTest returns null when the random bucket falls outside all
  // defined ranges (i.e. weights sum to less than 100). filled[0] is the
  // fallback so selected is always non-null after this point.
  if (!selected) {
    selected = determineABTest(filled) ?? filled[0];
  }

  // Persist the assignment so subsequent visits return the same variant.
  try {
    localStorage.setItem(storageKey, JSON.stringify(selected));
  } catch {
    // localStorage unavailable
  }

  // Control is the arm named by controlId, not "anything that is not treatment".
  // With two variants the two readings agree. With three or more they do not: a
  // middle arm that still resolves EIDs — say one carrying skipMatchers — would
  // be classified as a holdout and have its cache cleared below, which both
  // corrupts the measurement and strands the user on an empty cache for the rest
  // of the session.
  const isControl = selected.id === controlId;
  const assignment = selected.id;

  // Control group: clear cached targeting data so RTD, PPID and TargetingFromCache
  // serve nothing for this user. Without this, a user moved into the control group
  // would still receive Optable targeting from a previous session's cache.
  if (isControl) {
    try {
      localStorage.removeItem("OPTABLE_RESOLVED");
      if (sdk) {
        sdk.targetingClearCache();
      } else {
        Object.keys(localStorage)
          .filter((k) => k.startsWith("OPTABLE_TARGETING_"))
          .forEach((k) => localStorage.removeItem(k));
      }
    } catch {
      // localStorage unavailable
    }
  }

  function applyToAuctionEvent(event: { bidderRequests?: any[] }): void {
    (event.bidderRequests || []).forEach((br: any) => {
      (br.bids || []).forEach((b: any) => {
        if (b.ortb2Imp?.ext?.optable?.splitTestAssignment) return;
        b.ortb2Imp = b.ortb2Imp || {};
        b.ortb2Imp.ext = b.ortb2Imp.ext || {};
        b.ortb2Imp.ext.optable = b.ortb2Imp.ext.optable || {};
        b.ortb2Imp.ext.optable.splitTestAssignment = assignment;
      });
    });
  }

  function registerHooks(pbjsInstance: any): void {
    pbjsInstance.getEvents().forEach((event: any) => {
      if (event.eventType === "auctionEnd") {
        applyToAuctionEvent(event.args);
      }
    });
    pbjsInstance.onEvent("auctionEnd", applyToAuctionEvent);
  }

  // Mirrors OptablePrebidAnalytics.hookIntoPrebid: when Prebid.js has not
  // finished loading yet (`onEvent` is not a function), defer registration onto
  // its command queue so hooks attach once the real global drains `que`.
  // This lets callers pass a queue-only stub (`{ que: [] }`) safely instead of
  // having to queue `setHooks` themselves.
  function setHooks(pbjsInstance: any): void {
    if (!pbjsInstance) return;
    if (typeof pbjsInstance.onEvent !== "function") {
      pbjsInstance.que = pbjsInstance.que || [];
      pbjsInstance.que.push(() => registerHooks(pbjsInstance));
    } else {
      registerHooks(pbjsInstance);
    }
  }

  if (pbjs) {
    setHooks(pbjs);
  }

  return {
    variant: selected,
    isControl,
    splitTestAssignment: assignment,
    setHooks,
  };
}
