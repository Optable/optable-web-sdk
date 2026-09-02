import { debugLog } from "../core/log";

// UID2 refresh token response body. Also the shape carried on a cached EID's
// _ref, resolved from the targeting response refs map.
type Uid2RefData = {
  advertising_token: string;
  refresh_token: string;
  refresh_response_key: string;
  refresh_from: number;
  refresh_expires: number;
  identity_expires: number;
};

type Uid2RefreshResult =
  | { status: "success"; body: Uid2RefData }
  | { status: "optout" }
  | { status: "error"; reason: string; message?: string };

const UID2_REFRESH_ENDPOINT = "https://prod.uidapi.com/v2/token/refresh";

function isUid2RefData(body: unknown): body is Uid2RefData {
  const b = body as Record<string, unknown> | null | undefined;
  return (
    !!b &&
    typeof b.advertising_token === "string" &&
    typeof b.refresh_token === "string" &&
    typeof b.refresh_response_key === "string" &&
    typeof b.refresh_from === "number" &&
    typeof b.refresh_expires === "number" &&
    typeof b.identity_expires === "number"
  );
}

// Refresh responses are base64(12-byte nonce || AES-GCM ciphertext), keyed by
// the refresh_response_key issued alongside the refresh token.
//
// A response that cannot be decoded or decrypted throws; error policy stays
// with the caller.
async function refreshUid2Token(
  refreshToken: string,
  refreshResponseKey: string,
  endpoint: string = UID2_REFRESH_ENDPOINT
): Promise<Uid2RefreshResult> {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: refreshToken,
  });
  if (!response.ok) {
    // Error responses (400/401) are unencrypted JSON carrying a documented
    // status (client_error, invalid_token, expired_token, unauthorized) and a
    // free-form message.
    let reason = `HTTP ${response.status}`;
    let message: string | undefined;
    try {
      const body = JSON.parse(await response.text());
      if (typeof body?.status === "string") {
        reason = body.status;
      }
      if (typeof body?.message === "string") {
        message = body.message;
      }
    } catch {
      // Non-JSON error body; keep the HTTP status as the reason.
    }
    return { status: "error", reason, message };
  }

  const encrypted = await response.text();
  const encryptedBytes = Uint8Array.from(atob(encrypted), (c) => c.charCodeAt(0));
  const keyBytes = Uint8Array.from(atob(refreshResponseKey), (c) => c.charCodeAt(0));
  const nonce = encryptedBytes.slice(0, 12);
  const ciphertext = encryptedBytes.slice(12);

  const cryptoKey = await crypto.subtle.importKey("raw", keyBytes, { name: "AES-GCM" }, false, ["decrypt"]);
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv: nonce }, cryptoKey, ciphertext);
  const parsed = JSON.parse(new TextDecoder().decode(decrypted));

  if (parsed?.status === "optout") {
    return { status: "optout" };
  }
  if (parsed?.status !== "success") {
    return { status: "error", reason: `operator status "${parsed?.status}"` };
  }
  if (!isUid2RefData(parsed.body)) {
    return { status: "error", reason: "malformed response body" };
  }
  return { status: "success", body: parsed.body };
}

// An EID from the rolling cache carrying UID2 refresh material on _ref, as
// stamped by the eid-cache module's resolveRefs.
type StaleUid2Eid = {
  source: string;
  uids?: Array<{ id?: string; atype?: number }>;
  _ref?: Uid2RefData;
};

type RefreshStaleOptions = {
  // localStorage key of the rolling EID cache. Defaults to OPTABLE_RESOLVED.
  cacheKey?: string;
  // Forwarded to refreshUid2Token.
  endpoint?: string;
  // Called after each cache write, so callers can re-propagate the cache
  // (for example re-merge prebid's pubProvidedId in ppid delivery).
  onCacheUpdated?: () => void;
};

const DEFAULT_CACHE_KEY = "OPTABLE_RESOLVED";

/*
 * Refreshes stale UID2 EIDs (typically the staleUid2s returned by the
 * eid-cache module's mergeCache) and rewrites the cached EID in place. A
 * refresh the operator rejects — expired, opted out — removes the EID from
 * the cache; a network or decryption failure leaves the cache untouched so a
 * later page load can retry.
 *
 * EIDs are refreshed sequentially: each iteration re-reads and rewrites the
 * cache, so concurrent writes cannot clobber each other.
 */
async function refreshStaleUid2s(staleEids: StaleUid2Eid[], options: RefreshStaleOptions = {}): Promise<void> {
  const cacheKey = options.cacheKey ?? DEFAULT_CACHE_KEY;

  for (const eid of staleEids) {
    try {
      const ref = eid._ref;
      if (!ref?.refresh_token || !ref?.refresh_response_key) continue;

      const result = await refreshUid2Token(ref.refresh_token, ref.refresh_response_key, options.endpoint);

      const resolved = JSON.parse(localStorage.getItem(cacheKey) || "null");
      const cachedEids: StaleUid2Eid[] | undefined = resolved?.ortb2?.user?.eids;
      const idx = cachedEids?.findIndex((e) => e.source === eid.source) ?? -1;
      if (!cachedEids || idx === -1) continue;

      if (result.status === "success") {
        const body = result.body;
        cachedEids[idx].uids = [{ atype: 3, id: body.advertising_token }];
        cachedEids[idx]._ref = {
          advertising_token: body.advertising_token,
          refresh_token: body.refresh_token,
          refresh_response_key: body.refresh_response_key,
          refresh_from: body.refresh_from,
          refresh_expires: body.refresh_expires,
          identity_expires: body.identity_expires,
        };
        debugLog("log", "UID2: token refreshed");
      } else {
        cachedEids.splice(idx, 1);
        const reason = result.status === "optout" ? "optout" : result.reason;
        debugLog("log", `UID2: refresh failed (${reason}), removing stale token`);
      }

      localStorage.setItem(cacheKey, JSON.stringify(resolved));
      options.onCacheUpdated?.();
    } catch (err) {
      debugLog("error", "UID2: refresh error", err);
    }
  }
}

export { refreshUid2Token, refreshStaleUid2s, UID2_REFRESH_ENDPOINT };
export type { Uid2RefData, Uid2RefreshResult, StaleUid2Eid, RefreshStaleOptions };
