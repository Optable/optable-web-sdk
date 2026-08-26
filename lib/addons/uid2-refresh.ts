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

export { refreshUid2Token, UID2_REFRESH_ENDPOINT };
export type { Uid2RefData, Uid2RefreshResult };
