import type { ABTestConfig } from "../config";
import { determineABTest } from "../edge/abTest";
import { getFlags } from "../core/flags";

const DEFAULT_STORAGE_KEY = "OPTABLE_SPLIT_TEST";

export interface ABTestVariant {
  id: string;
  trafficPercentage?: number;
}

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
    id: v.id,
    trafficPercentage: v.trafficPercentage ?? each,
  }));
}

export function setupAB(config: SetupABConfig): ABTestSetupResult {
  const { variants, storageKey = DEFAULT_STORAGE_KEY, controlId = "test", treatmentId = "production", sdk, pbjs } = config;

  // Process the provided variant config so that every variant has an explicit traffic percentage.
  // Variants without one share the remaining percentage equally.
  const filled = fillTrafficPercentages(variants);

  let selected: ABTestConfig | null = null;

  // Priority 1 — QA/debug override via URL param or sessionStorage flag.
  // ?optableControlGroup=1 forces the control variant; =0 forces treatment.
  // This lets QA verify both branches without clearing localStorage.
  const controlGroupFlag = getFlags().optableControlGroup;
  if (controlGroupFlag === "1") {
    selected = filled.find((v) => v.id === controlId) ?? { id: controlId, trafficPercentage: 0 };
  } else if (controlGroupFlag === "0") {
    selected = filled.find((v) => v.id === treatmentId) ?? { id: treatmentId, trafficPercentage: 0 };
  }

  // Priority 2 — sticky assignment from a previous visit.
  // Once a user is assigned a variant it must not change across page loads or
  // sessions, otherwise the same user could appear in both groups. We validate
  // the cached id against the current variant list so a stale cache from an
  // old experiment config is silently discarded.
  if (!selected) {
    try {
      const cached = localStorage.getItem(storageKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.id && filled.some((v) => v.id === parsed.id)) {
          selected = parsed as ABTestConfig;
        }
      }
    } catch {
      // localStorage unavailable or invalid JSON
    }
  }

  // Priority 3 — first visit: randomly assign based on traffic weights.
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

  const isControl = selected.id !== treatmentId;
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

  function setHooks(pbjsInstance: any): void {
    pbjsInstance.getEvents().forEach((event: any) => {
      if (event.eventType === "auctionEnd") {
        applyToAuctionEvent(event.args);
      }
    });
    pbjsInstance.onEvent("auctionEnd", applyToAuctionEvent);
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
