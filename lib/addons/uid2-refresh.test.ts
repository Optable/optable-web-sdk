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

function respondWith(text: string, status = 200, endpoint = UID2_REFRESH_ENDPOINT) {
  server.use(http.post(endpoint, () => new HttpResponse(text, { status })));
}

describe("refreshUid2Token", () => {
  it("decrypts a successful refresh response and returns its body", async () => {
    respondWith(await encryptResponse({ status: "success", body: BODY }));
    await expect(refreshUid2Token("REFRESH_TOKEN", KEY_B64)).resolves.toEqual({ status: "success", body: BODY });
  });

  it("posts the refresh token as a raw text/plain body", async () => {
    let sent: string | undefined;
    let contentType: string | null = null;
    const encrypted = await encryptResponse({ status: "success", body: BODY });
    server.use(
      http.post(UID2_REFRESH_ENDPOINT, async ({ request }) => {
        sent = await request.text();
        contentType = request.headers.get("content-type");
        return new HttpResponse(encrypted, { status: 200 });
      })
    );
    await refreshUid2Token("REFRESH_TOKEN", KEY_B64);
    expect(sent).toBe("REFRESH_TOKEN");
    expect(contentType).toContain("text/plain");
  });

  it("uses a caller-provided endpoint", async () => {
    const endpoint = "https://operator-integ.uidapi.com/v2/token/refresh";
    respondWith(await encryptResponse({ status: "success", body: BODY }), 200, endpoint);
    await expect(refreshUid2Token("REFRESH_TOKEN", KEY_B64, endpoint)).resolves.toEqual({
      status: "success",
      body: BODY,
    });
  });

  it("returns the operator's status as the reason on a non-OK response", async () => {
    respondWith(JSON.stringify({ status: "expired_token", message: "refresh token expired" }), 400);
    await expect(refreshUid2Token("REFRESH_TOKEN", KEY_B64)).resolves.toEqual({
      status: "error",
      reason: "expired_token",
    });
  });

  it("falls back to the HTTP status on a non-OK response without a JSON body", async () => {
    respondWith("", 400);
    await expect(refreshUid2Token("REFRESH_TOKEN", KEY_B64)).resolves.toEqual({
      status: "error",
      reason: "HTTP 400",
    });
  });

  it("returns an optout result on an opt-out response", async () => {
    respondWith(await encryptResponse({ status: "optout" }));
    await expect(refreshUid2Token("REFRESH_TOKEN", KEY_B64)).resolves.toEqual({ status: "optout" });
  });

  it("returns an error result on an encrypted 200 that is neither success nor optout", async () => {
    respondWith(await encryptResponse({ status: "something_new" }));
    await expect(refreshUid2Token("REFRESH_TOKEN", KEY_B64)).resolves.toEqual({
      status: "error",
      reason: 'operator status "something_new"',
    });
  });

  it.each([
    ["missing advertising_token", { ...BODY, advertising_token: undefined }],
    ["missing refresh_token", { ...BODY, refresh_token: undefined }],
    ["missing refresh_expires", { ...BODY, refresh_expires: undefined }],
    ["non-numeric refresh_from", { ...BODY, refresh_from: "soon" }],
  ])("returns an error result on a success payload with %s", async (_label, body) => {
    respondWith(await encryptResponse({ status: "success", body }));
    await expect(refreshUid2Token("REFRESH_TOKEN", KEY_B64)).resolves.toEqual({
      status: "error",
      reason: "malformed response body",
    });
  });

  it("throws on a payload that does not decrypt", async () => {
    respondWith(Buffer.from(webcrypto.getRandomValues(new Uint8Array(64))).toString("base64"));
    await expect(refreshUid2Token("REFRESH_TOKEN", KEY_B64)).rejects.toBeDefined();
  });
});
