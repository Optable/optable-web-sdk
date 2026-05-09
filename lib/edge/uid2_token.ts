import type { ResolvedConfig } from "../config";
import { fetch } from "../core/network";

type Uid2TokenResponse = {
  advertising_token: string;
  RefreshToken: string;
  IdentityExpires: number;
  RefreshFrom: number;
  RefreshExpires: number;
  RefreshResponseKey: string;
};

type Uid2RefreshBody = {
  advertising_token: string;
  refresh_token: string;
  identity_expires: number;
  refresh_from: number;
  refresh_expires: number;
  refresh_response_key: string;
};

function Uid2Token(config: ResolvedConfig, id: string): Promise<Uid2TokenResponse> {
  return fetch("/uid2/token", config, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(id),
  });
}

async function decryptUid2Response(encryptedBase64: string, responseKeyBase64: string): Promise<string> {
  const encryptedBytes = Uint8Array.from(atob(encryptedBase64), (c) => c.charCodeAt(0));
  const keyBytes = Uint8Array.from(atob(responseKeyBase64), (c) => c.charCodeAt(0));
  const nonce = encryptedBytes.slice(0, 12);
  const ciphertext = encryptedBytes.slice(12);
  const cryptoKey = await crypto.subtle.importKey("raw", keyBytes, { name: "AES-GCM" }, false, ["decrypt"]);
  const decryptedBuffer = await crypto.subtle.decrypt({ name: "AES-GCM", iv: nonce }, cryptoKey, ciphertext);
  return new TextDecoder().decode(decryptedBuffer);
}

async function Uid2Refresh(refreshToken: string, refreshResponseKey: string): Promise<Uid2RefreshBody | null> {
  const response = await globalThis.fetch("https://prod.uidapi.com/v2/token/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: refreshToken,
  });
  if (!response.ok) return null;
  const encrypted = await response.text();
  const decrypted = await decryptUid2Response(encrypted, refreshResponseKey);
  const { body } = JSON.parse(decrypted) as { body?: Uid2RefreshBody };
  return body ?? null;
}

export { Uid2Token, Uid2Refresh };
export default Uid2Token;
export type { Uid2TokenResponse, Uid2RefreshBody };
