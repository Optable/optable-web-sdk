import { AgentType } from "iab-adcom";
import type { ResolvedConfig } from "../config";
import { isUid2RefData } from "../core/eid-cache";
import type { StaleUid2, Uid2RefData } from "../core/eid-cache";
import { LocalStorage } from "../core/storage";
import { sendTargetingUpdateEvent } from "../core/events/cache-refresh";
import { debugLog } from "../core/log";

type Uid2RefreshResult =
  | { status: "success"; body: Uid2RefData }
  | { status: "optout" }
  | { status: "error"; reason: string; message?: string };

const UID2_REFRESH_ENDPOINT = "https://prod.uidapi.com/v2/token/refresh";

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

// Operator rejections that mean the cached identity is definitively dead.
const EVICTION_REASONS = new Set(["invalid_token", "expired_token"]);

/**
 * Applies a refresh outcome to the targeting cache: success rewrites the
 * matching EID and its refs sidecar entry, optout and definitive rejections
 * evict both, any other error leaves the cache untouched for retry on the
 * next page load. Sends the targeting change event after each write.
 */
function applyUid2Refresh(config: ResolvedConfig, source: string, result: Uid2RefreshResult): void {
  if (result.status === "error" && !EVICTION_REASONS.has(result.reason)) {
    return;
  }

  const updated = new LocalStorage(config).updateTargeting((cached) => {
    const eids = cached?.ortb2?.user?.eids;
    // If cache does not exist don't try to set.
    if (!eids) {
      return false;
    }

    const idx = eids.findIndex((e) => e.source === source);
    if (idx === -1) {
      return false;
    }

    if (result.status === "success") {
      eids[idx].uids = [{ atype: AgentType.PERSON_BASED, id: result.body.advertising_token }];
      cached.refs = { ...cached.refs, [source]: result.body };
    } else {
      eids.splice(idx, 1);
      if (cached.refs) {
        delete cached.refs[source];
      }
    }
    return true;
  });

  if (updated) {
    sendTargetingUpdateEvent(config, updated);
  }
}

/**
 * Refreshes every stale UID2 returned by mergeCache against the operator and
 * applies each outcome to the targeting cache. Never throws into the host page:
 * a failed entry is logged and the rest still run.
 */
async function refreshStaleUid2s(config: ResolvedConfig, stale: StaleUid2[]): Promise<void> {
  if (stale.length) {
    debugLog("info", `UID2: refreshing ${stale.length} stale token(s)`);
  }

  // Sequential: each apply is a read-modify-write of the same cache copies.
  for (const entry of stale) {
    try {
      if (!isUid2RefData(entry?.ref)) {
        continue;
      }

      const result = await refreshUid2Token(entry.ref.refresh_token, entry.ref.refresh_response_key);
      if (result.status === "success") {
        debugLog("info", `UID2: ${entry.source} refreshed`);
      } else if (result.status === "optout") {
        debugLog("info", `UID2: ${entry.source} opted out, removing token`);
      } else {
        debugLog("warn", `UID2: ${entry.source} refresh failed (${result.reason})`, result.message);
      }

      applyUid2Refresh(config, entry.source, result);
    } catch (e) {
      debugLog("error", `UID2: ${entry?.source} refresh error`, e);
    }
  }
}

export { refreshUid2Token, applyUid2Refresh, refreshStaleUid2s, UID2_REFRESH_ENDPOINT };
export type { Uid2RefData, Uid2RefreshResult };
