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

  const filled = fillTrafficPercentages(variants);

  let selected: ABTestConfig | null = null;

  const controlGroupFlag = getFlags().optableControlGroup;
  if (controlGroupFlag === "1") {
    selected = filled.find((v) => v.id === controlId) ?? { id: controlId, trafficPercentage: 0 };
  } else if (controlGroupFlag === "0") {
    selected = filled.find((v) => v.id === treatmentId) ?? { id: treatmentId, trafficPercentage: 0 };
  }

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

  if (!selected) {
    selected = determineABTest(filled) ?? filled[0];
  }

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
