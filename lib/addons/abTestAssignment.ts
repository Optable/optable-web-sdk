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
  // The variant id treated as "control" (Optable disabled). Defaults to 'none'.
  controlId?: string;
  // The variant id treated as "treatment" (Optable enabled). Defaults to 'all'.
  treatmentId?: string;
}

export interface ABTestSetupResult {
  variant: ABTestConfig;
  isControl: boolean;
  getSplitTestAssignment: () => string;
  // Stamps splitTestAssignment onto all bids in a prebid auctionEnd event object.
  applyToAuctionEvent: (event: { bidderRequests?: any[] }) => void;
  // Registers a prebid onEvent hook so every future auction is stamped automatically.
  // Call this before analytics.setHooks(pbjs) so the value is present when analytics reads it.
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
  const { variants, storageKey = DEFAULT_STORAGE_KEY, controlId = "none", treatmentId = "all" } = config;

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

  function setHooks(pbjs: any): void {
    pbjs.getEvents().forEach((event: any) => {
      if (event.eventType === "auctionEnd") {
        applyToAuctionEvent(event.args);
      }
    });
    pbjs.onEvent("auctionEnd", applyToAuctionEvent);
  }

  return {
    variant: selected,
    isControl,
    getSplitTestAssignment: () => assignment,
    applyToAuctionEvent,
    setHooks,
  };
}
