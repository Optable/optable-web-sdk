import { webcrypto } from "node:crypto";
import { TextDecoder } from "node:util";
import { http, HttpResponse } from "msw";
import { server } from "../test/server";
import { refreshUid2Token, UID2_REFRESH_ENDPOINT, Uid2RefData } from "./uid2-refresh";

Object.defineProperty(globalThis, "crypto", { value: webcrypto, configurable: true });
(globalThis as { TextDecoder?: unknown }).TextDecoder = TextDecoder;

const KEY_BYTES = webcrypto.getRandomValues(new Uint8Array(32));
const KEY_B64 = Buffer.from(KEY_BYTES).toString("base64");

const BODY: Uid2RefData = {
  advertising_token: "ADVERTISING_TOKEN",
  refresh_token: "NEW_REFRESH_TOKEN",
  refresh_response_key: "NEW_RESPONSE_KEY",
  refresh_from: 1734462312780,
  refresh_expires: 2734462312780,
  identity_expires: 1734459312780,
};

async function encryptResponse(payload: unknown): Promise<string> {
  const iv = webcrypto.getRandomValues(new Uint8Array(12));
  const key = await webcrypto.subtle.importKey("raw", KEY_BYTES, { name: "AES-GCM" }, false, ["encrypt"]);
  const plaintext = new TextEncoder().encode(JSON.stringify(payload));
  const ciphertext = new Uint8Array(await webcrypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext));
  const out = new Uint8Array(iv.length + ciphertext.length);
  out.set(iv);
  out.set(ciphertext, iv.length);
  return Buffer.from(out).toString("base64");
}

function respondWith(text: string, status = 200) {
  server.use(http.post(UID2_REFRESH_ENDPOINT, () => new HttpResponse(text, { status })));
}

describe("refreshUid2Token", () => {
  it("decrypts a successful refresh response and returns its body", async () => {
    respondWith(await encryptResponse({ status: "success", body: BODY }));
    await expect(refreshUid2Token("REFRESH_TOKEN", KEY_B64)).resolves.toEqual(BODY);
  });

  it("posts the refresh token as the raw request body", async () => {
    let sent: string | undefined;
    const encrypted = await encryptResponse({ status: "success", body: BODY });
    server.use(
      http.post(UID2_REFRESH_ENDPOINT, async ({ request }) => {
        sent = await request.text();
        return new HttpResponse(encrypted, { status: 200 });
      })
    );
    await refreshUid2Token("REFRESH_TOKEN", KEY_B64);
    expect(sent).toBe("REFRESH_TOKEN");
  });

  it("returns null on a non-OK response", async () => {
    respondWith("", 400);
    await expect(refreshUid2Token("REFRESH_TOKEN", KEY_B64)).resolves.toBeNull();
  });

  it("returns null on an opt-out response", async () => {
    respondWith(await encryptResponse({ status: "optout" }));
    await expect(refreshUid2Token("REFRESH_TOKEN", KEY_B64)).resolves.toBeNull();
  });

  it("returns null when the body has no advertising_token", async () => {
    respondWith(await encryptResponse({ status: "success", body: { refresh_token: "X" } }));
    await expect(refreshUid2Token("REFRESH_TOKEN", KEY_B64)).resolves.toBeNull();
  });

  it("throws on a payload that does not decrypt", async () => {
    respondWith(Buffer.from(webcrypto.getRandomValues(new Uint8Array(64))).toString("base64"));
    await expect(refreshUid2Token("REFRESH_TOKEN", KEY_B64)).rejects.toBeDefined();
  });
});
