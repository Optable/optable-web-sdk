import { mergeCache, replaceCache } from "./eid-cache";
import type { ResolvedCache, StaleUid2 } from "./eid-cache";
import { sendTargetingUpdateEvent } from "./events/cache-refresh";
import { flagEnabled } from "./flags";
import { debugLog } from "./log";
import type OptableSDK from "../sdk";
import type { TargetingResponse } from "../edge/targeting";

// Publisher-facing identity entry point: identifies a hashed email (or other
// prefixed id) and, outside the control group, tokenizes it and merges the
// resulting EIDs into the rolling cache. Runs once per session
// (OPTABLE_TOKENIZE_DONE), re-runnable with the optableForceTokenize flag; the
// guard resets on error so a failed tokenize can retry.

const TOKENIZE_DONE_KEY = "OPTABLE_TOKENIZE_DONE";
const DEFAULT_CACHE_KEY = "OPTABLE_RESOLVED";
const FINGERPRINT_SALT = "optable-id-fingerprint-v1";

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
  let decoded = id;
  try {
    decoded = decodeURIComponent(id);
  } catch {
    // Not URI-encoded (a bare % throws); take the id as given.
  }
  if (!decoded.match(/^[a-z0-9]{1,3}:/i) && !decoded.match(/^utiq:/)) {
    return `e:${decoded}`;
  }
  return decoded;
}

// The guard records a fingerprint of the id, never the id. Noticing a change is
// all it needs, and the raw value would put a user identifier under our own key
// in storage every frame on the page can read.
function idFingerprint(id: string): string {
  let hash = 2166136261;
  const salted = `${FINGERPRINT_SALT}:${id}`;
  for (let i = 0; i < salted.length; i++) {
    hash ^= salted.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

export async function identifyAndTokenize(
  sdk: OptableSDK,
  id: string,
  options: IdentifyAndTokenizeOptions = {}
): Promise<IdentifyAndTokenizeResult> {
  if (!id) {
    return null;
  }

  const finalId = normalizeId(id);
  // Keyed on the id, so signing in as someone else in the same tab resolves
  // them rather than being swallowed by the guard.
  const fingerprint = idFingerprint(finalId);
  if (sessionStorage.getItem(TOKENIZE_DONE_KEY) === fingerprint && !flagEnabled("optableForceTokenize")) {
    return null;
  }

  sessionStorage.setItem(TOKENIZE_DONE_KEY, fingerprint);

  // identify always runs, control group included. It is deliberately not
  // awaited, and its failure does not reset the guard: that guards tokenize.
  debugLog("log", "identify");
  sdk.identify(finalId).catch((err) => debugLog("error", "identify: error", err));

  if (options.isControlGroup?.()) {
    debugLog("log", "tokenize: skipped (control group)");
    return null;
  }

  try {
    debugLog("log", "tokenize");
    // tokenize resolves { user }, but a wrapper shim may hand back an
    // ortb2-shaped body, so accept either rather than nesting one twice.
    const response = (await sdk.tokenize(finalId)) as { ortb2?: unknown };
    const asCache = (response?.ortb2 ? response : { ortb2: response }) as ResolvedCache;

    const cacheKey = options.cacheKey ?? DEFAULT_CACHE_KEY;
    let cached: ResolvedCache | null = null;
    try {
      cached = JSON.parse(localStorage.getItem(cacheKey) || "null");
    } catch {
      // Corrupt cache; merge onto nothing and overwrite it rather than
      // failing the call and re-running both requests on every later one.
    }

    // mergeCache takes cache format; replaceCache is idempotent, so this is
    // free insurance should tokenize ever carry UID2 refresh pointers.
    const result = mergeCache(replaceCache(asCache), cached, { maxUidsPerEid: options.maxUidsPerEid });
    localStorage.setItem(cacheKey, JSON.stringify(result.merged));
    sendTargetingUpdateEvent(sdk.dcn, result.merged as TargetingResponse);

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
