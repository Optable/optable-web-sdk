import { mergeCache } from "./eid-cache";
import type { ResolvedCache, StaleUid2 } from "./eid-cache";
import { sendTargetingUpdateEvent } from "./events/cache-refresh";
import { flagEnabled } from "./flags";
import { debugLog } from "./log";
import type OptableSDK from "../sdk";

// Publisher-facing identity entry point: identifies a hashed email (or other
// prefixed id) and, outside the control group, tokenizes it and merges the
// resulting EIDs into the rolling cache. Runs once per session
// (OPTABLE_TOKENIZE_DONE), re-runnable with the optableForceTokenize flag; the
// guard resets on error so a failed tokenize can retry.

const TOKENIZE_DONE_KEY = "OPTABLE_TOKENIZE_DONE";
const DEFAULT_CACHE_KEY = "OPTABLE_RESOLVED";

type IdentifyAndTokenizeOptions = {
  // Split-test gate: while true, identify still runs but tokenize is skipped,
  // so the control group gets no EIDs.
  isControlGroup?: () => boolean;
  // localStorage key of the rolling EID cache. Defaults to OPTABLE_RESOLVED.
  cacheKey?: string;
  // Cap on UIDs kept per EID, forwarded to mergeCache.
  maxUidsPerEid?: number;
};

type IdentifyAndTokenizeResult = {
  merged: ResolvedCache;
  staleUid2s: StaleUid2[];
} | null;

// Bare ids get the hashed-email prefix; ids already carrying a short prefix
// ("e:", "c:", …) or a utiq id pass through unchanged.
function normalizeId(id: string): string {
  const decoded = decodeURIComponent(id);
  if (!decoded.match(/^.{1,3}:/) && !decoded.match(/utiq:/)) {
    return `e:${decoded}`;
  }
  return decoded;
}

export async function identifyAndTokenize(
  sdk: OptableSDK,
  id: string,
  options: IdentifyAndTokenizeOptions = {}
): Promise<IdentifyAndTokenizeResult> {
  if (!id || (sessionStorage.getItem(TOKENIZE_DONE_KEY) && !flagEnabled("optableForceTokenize"))) {
    return null;
  }

  const finalId = normalizeId(id);
  sessionStorage.setItem(TOKENIZE_DONE_KEY, "1");

  // identify always runs, control group included.
  debugLog("log", "identify");
  sdk.identify(finalId);

  if (options.isControlGroup?.()) {
    debugLog("log", "tokenize: skipped (control group)");
    return null;
  }

  try {
    debugLog("log", "tokenize");
    const response = (await sdk.tokenize(finalId)) as { ortb2?: unknown };
    const asCache = (response?.ortb2 ? response : { ortb2: response }) as ResolvedCache;

    const cacheKey = options.cacheKey ?? DEFAULT_CACHE_KEY;
    const cached = JSON.parse(localStorage.getItem(cacheKey) || "null");
    const result = mergeCache(asCache, cached, { maxUidsPerEid: options.maxUidsPerEid });
    localStorage.setItem(cacheKey, JSON.stringify(result.merged));
    sendTargetingUpdateEvent(sdk.dcn, result.merged as Parameters<typeof sendTargetingUpdateEvent>[1]);

    debugLog("log", "tokenize: done");
    return result;
  } catch (err) {
    // Reset the guard so a later call can retry.
    sessionStorage.removeItem(TOKENIZE_DONE_KEY);
    debugLog("error", "tokenize: error", err);
    return null;
  }
}

export type { IdentifyAndTokenizeOptions, IdentifyAndTokenizeResult };
