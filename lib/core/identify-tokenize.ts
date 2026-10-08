import { mergeCache, replaceCache } from "./eid-cache";
import type { ResolvedCache, StaleUid2 } from "./eid-cache";
import { sendTargetingUpdateEvent } from "./events/cache-refresh";
import { flagEnabled } from "./flags";
import { debugLog } from "./log";
import type OptableSDK from "../sdk";
import type { TargetingResponse } from "../edge/targeting";

// Publisher-facing identity entry point: identifies a hashed email or other
// prefixed id and, outside the control group, tokenizes it and merges the
// resulting EIDs into the rolling cache.

const TOKENIZE_DONE_KEY = "OPTABLE_TOKENIZE_DONE";
const DEFAULT_CACHE_KEY = "OPTABLE_RESOLVED";
const FINGERPRINT_SALT = "optable-id-fingerprint-v1";

type IdentifyAndTokenizeOptions = {
  // While true, identify still runs but tokenize is skipped.
  isControlGroup?: () => boolean;
  cacheKey?: string;
  maxUidsPerEid?: number;
};

type IdentifyAndTokenizeResult = {
  merged: ResolvedCache;
  staleUid2s: StaleUid2[];
} | null;

// Bare ids get the hashed-email prefix; already-prefixed and utiq ids pass through.
function normalizeId(id: string): string {
  let decoded = id;
  try {
    decoded = decodeURIComponent(id);
  } catch {
    // Not URI-encoded; a bare % throws.
  }
  if (!decoded.match(/^[a-z0-9]{1,3}:/i) && !decoded.match(/^utiq:/)) {
    return `e:${decoded}`;
  }
  return decoded;
}

// The guard stores this, never the id: storage every frame on the page can
// read is no place for a user identifier.
function idFingerprint(id: string): string {
  let hash = 2166136261;
  const salted = `${FINGERPRINT_SALT}:${id}`;
  for (let i = 0; i < salted.length; i++) {
    hash ^= salted.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

// sessionStorage throws in some embedded and private-mode contexts; the guard
// degrades to never tripping rather than failing the call.
function readGuard(): string | null {
  try {
    return sessionStorage.getItem(TOKENIZE_DONE_KEY);
  } catch {
    return null;
  }
}

function writeGuard(fingerprint: string): void {
  try {
    sessionStorage.setItem(TOKENIZE_DONE_KEY, fingerprint);
  } catch {
    // Unavailable.
  }
}

// Clears only our own entry: a concurrent call for another id owns its.
function clearGuard(fingerprint: string): void {
  try {
    if (sessionStorage.getItem(TOKENIZE_DONE_KEY) === fingerprint) {
      sessionStorage.removeItem(TOKENIZE_DONE_KEY);
    }
  } catch {
    // Unavailable.
  }
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
  // Keyed on the id, so a different id in the same tab still resolves.
  const fingerprint = idFingerprint(finalId);
  if (readGuard() === fingerprint && !flagEnabled("optableForceTokenize")) {
    return null;
  }

  writeGuard(fingerprint);

  // Runs for the control group too, and is not awaited. A failure leaves the
  // guard set, which guards tokenize.
  debugLog("log", "identify");
  sdk.identify(finalId).catch((err) => debugLog("error", "identify: error", err));

  if (options.isControlGroup?.()) {
    debugLog("log", "tokenize: skipped (control group)");
    return null;
  }

  try {
    debugLog("log", "tokenize");
    // tokenize resolves { user }, but a wrapper shim may return an
    // ortb2-shaped body; accept either rather than nesting one twice.
    const response = (await sdk.tokenize(finalId)) as { ortb2?: unknown };
    const asCache = (response?.ortb2 ? response : { ortb2: response }) as ResolvedCache;

    const cacheKey = options.cacheKey ?? DEFAULT_CACHE_KEY;
    let cached: ResolvedCache | null = null;
    try {
      cached = JSON.parse(localStorage.getItem(cacheKey) || "null");
    } catch {
      // Corrupt cache: merge onto nothing and overwrite it.
    }

    // mergeCache takes cache format, and replaceCache is idempotent.
    const result = mergeCache(replaceCache(asCache), cached, { maxUidsPerEid: options.maxUidsPerEid });
    localStorage.setItem(cacheKey, JSON.stringify(result.merged));
    sendTargetingUpdateEvent(sdk.dcn, result.merged as TargetingResponse);

    debugLog("log", "tokenize: done");
    return result;
  } catch (err) {
    // Reopen the guard so a later call retries.
    clearGuard(fingerprint);
    debugLog("error", "tokenize: error", err);
    return null;
  }
}

export type { IdentifyAndTokenizeOptions, IdentifyAndTokenizeResult };
