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

const UID2_REFRESH_ENDPOINT = "https://prod.uidapi.com/v2/token/refresh";

// Refresh responses are base64(12-byte nonce || AES-GCM ciphertext), keyed by
// the refresh_response_key issued alongside the refresh token.
//
// Returns null when the operator rejects the request, the user has opted out,
// or the response carries no advertising_token. A malformed response throws;
// error policy stays with the caller.
async function refreshUid2Token(refreshToken: string, refreshResponseKey: string): Promise<Uid2RefData | null> {
  const response = await fetch(UID2_REFRESH_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: refreshToken,
  });
  if (!response.ok) {
    return null;
  }

  const encrypted = await response.text();
  const encryptedBytes = Uint8Array.from(atob(encrypted), (c) => c.charCodeAt(0));
  const keyBytes = Uint8Array.from(atob(refreshResponseKey), (c) => c.charCodeAt(0));
  const nonce = encryptedBytes.slice(0, 12);
  const ciphertext = encryptedBytes.slice(12);

  const cryptoKey = await crypto.subtle.importKey("raw", keyBytes, { name: "AES-GCM" }, false, ["decrypt"]);
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv: nonce }, cryptoKey, ciphertext);
  const parsed = JSON.parse(new TextDecoder().decode(decrypted));
  return parsed.body?.advertising_token ? (parsed.body as Uid2RefData) : null;
}

export { refreshUid2Token, UID2_REFRESH_ENDPOINT };
export type { Uid2RefData };
