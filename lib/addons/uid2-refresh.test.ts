import { webcrypto } from "node:crypto";
import { TextDecoder } from "node:util";
import { http, HttpResponse } from "msw";
import { server } from "../test/server";
import { refreshUid2Token, applyUid2Refresh, refreshStaleUid2s, UID2_REFRESH_ENDPOINT } from "./uid2-refresh";
import type { Uid2RefData } from "../core/eid-cache";
import { DCN_DEFAULTS } from "../config";
import type { ResolvedConfig } from "../config";
import { LocalStorage } from "../core/storage";
import type { TargetingResponse } from "../edge/targeting";

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

  it("returns the operator's status and message on a non-OK response", async () => {
    respondWith(JSON.stringify({ status: "expired_token", message: "refresh token expired" }), 400);
    await expect(refreshUid2Token("REFRESH_TOKEN", KEY_B64)).resolves.toEqual({
      status: "error",
      reason: "expired_token",
      message: "refresh token expired",
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

describe("applyUid2Refresh", () => {
  const config = {
    host: "uid2-apply-host.com",
    site: "site",
    consent: DCN_DEFAULTS.consent,
    optableCacheTargeting: "OPTABLE_RESOLVED",
  } as ResolvedConfig;

  const OLD_REF: Uid2RefData = {
    advertising_token: "OLD_TOKEN",
    refresh_token: "OLD_REFRESH_TOKEN",
    refresh_response_key: "OLD_RESPONSE_KEY",
    refresh_from: 1,
    refresh_expires: 2,
    identity_expires: 3,
  };

  function seedCache(): void {
    const targeting = {
      ortb2: {
        user: {
          data: [],
          eids: [
            { source: "uidapi.com", uids: [{ atype: 3, id: "OLD_TOKEN" }], _ref: OLD_REF },
            { source: "other.com", uids: [{ id: "KEEP" }] },
          ],
        },
      },
    } as unknown as TargetingResponse;
    new LocalStorage(config).setTargeting(targeting);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function cachedEids(): any[] {
    return (new LocalStorage(config).getTargeting()?.ortb2?.user?.eids as any[]) ?? [];
  }

  const events: Event[] = [];
  const listener = (e: Event) => events.push(e);

  beforeEach(() => {
    localStorage.clear();
    events.length = 0;
    window.addEventListener("optable-targeting:change", listener);
  });

  afterEach(() => {
    window.removeEventListener("optable-targeting:change", listener);
  });

  it("rewrites the EID's uids and _ref on success and sends the change event", () => {
    seedCache();
    applyUid2Refresh(config, "uidapi.com", { status: "success", body: BODY });

    const eids = cachedEids();
    expect(eids).toHaveLength(2);
    expect(eids[0].uids).toEqual([{ atype: 3, id: BODY.advertising_token }]);
    expect(eids[0]._ref).toEqual(BODY);
    expect(eids[1].source).toBe("other.com");
    expect(events).toHaveLength(1);
  });

  it("removes the EID on optout and sends the change event", () => {
    seedCache();
    applyUid2Refresh(config, "uidapi.com", { status: "optout" });

    const eids = cachedEids();
    expect(eids).toHaveLength(1);
    expect(eids[0].source).toBe("other.com");
    expect(events).toHaveLength(1);
  });

  it("updates each cache copy independently, preserving a merged public copy", () => {
    seedCache();
    // The merged public copy carries an EID the private copy does not.
    const merged = JSON.parse(localStorage.getItem("OPTABLE_RESOLVED") as string);
    merged.ortb2.user.eids.push({ source: "carryover.com", uids: [{ id: "CARRIED" }] });
    localStorage.setItem("OPTABLE_RESOLVED", JSON.stringify(merged));

    applyUid2Refresh(config, "uidapi.com", { status: "success", body: BODY });

    const privateEids = cachedEids();
    expect(privateEids.map((e) => e.source)).toEqual(["uidapi.com", "other.com"]);
    expect(privateEids[0].uids).toEqual([{ atype: 3, id: BODY.advertising_token }]);

    const publicEids = JSON.parse(localStorage.getItem("OPTABLE_RESOLVED") as string).ortb2.user.eids;
    expect(publicEids.map((e: { source: string }) => e.source)).toEqual(["uidapi.com", "other.com", "carryover.com"]);
    expect(publicEids[0].uids).toEqual([{ atype: 3, id: BODY.advertising_token }]);
    expect(publicEids[0]._ref).toEqual(BODY);
  });

  it.each(["invalid_token", "expired_token"])("removes the EID on a definitive %s rejection", (reason) => {
    seedCache();
    applyUid2Refresh(config, "uidapi.com", { status: "error", reason });

    expect(cachedEids().map((e) => e.source)).toEqual(["other.com"]);
    expect(events).toHaveLength(1);
  });

  it.each(["HTTP 500", "client_error", "unauthorized", "malformed response body"])(
    "leaves the cache untouched on a transient %s error",
    (reason) => {
      seedCache();
      const before = localStorage.getItem("OPTABLE_RESOLVED");
      applyUid2Refresh(config, "uidapi.com", { status: "error", reason });

      expect(localStorage.getItem("OPTABLE_RESOLVED")).toBe(before);
      expect(cachedEids().map((e) => e.source)).toEqual(["uidapi.com", "other.com"]);
      expect(events).toHaveLength(0);
    }
  );

  it("does nothing when the source is not in the cache", () => {
    seedCache();
    applyUid2Refresh(config, "missing.com", { status: "optout" });

    expect(cachedEids()).toHaveLength(2);
    expect(events).toHaveLength(0);
  });

  it("does nothing when the cache is empty", () => {
    expect(() => applyUid2Refresh(config, "uidapi.com", { status: "optout" })).not.toThrow();
    expect(events).toHaveLength(0);
  });
});

describe("refreshStaleUid2s", () => {
  const config = {
    host: "uid2-loop-host.com",
    site: "site",
    consent: DCN_DEFAULTS.consent,
    optableCacheTargeting: "OPTABLE_RESOLVED",
  } as ResolvedConfig;

  const STALE_REF: Uid2RefData = {
    advertising_token: "OLD_TOKEN",
    refresh_token: "REFRESH_TOKEN",
    refresh_response_key: KEY_B64,
    refresh_from: 1,
    refresh_expires: 2734462312780,
    identity_expires: 1734459312780,
  };

  const staleEid = () => ({ source: "uidapi.com", uids: [{ atype: 3, id: "OLD_TOKEN" }], _ref: STALE_REF });

  function seedCache(): void {
    const targeting = {
      ortb2: { user: { data: [], eids: [staleEid(), { source: "other.com", uids: [{ id: "KEEP" }] }] } },
    } as unknown as TargetingResponse;
    new LocalStorage(config).setTargeting(targeting);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function cachedEids(): any[] {
    return (new LocalStorage(config).getTargeting()?.ortb2?.user?.eids as any[]) ?? [];
  }

  const events: Event[] = [];
  const listener = (e: Event) => events.push(e);

  beforeEach(() => {
    localStorage.clear();
    events.length = 0;
    window.addEventListener("optable-targeting:change", listener);
  });

  afterEach(() => {
    window.removeEventListener("optable-targeting:change", listener);
  });

  it("refreshes a stale token end to end and updates the cache", async () => {
    seedCache();
    respondWith(await encryptResponse({ status: "success", body: BODY }));

    await refreshStaleUid2s(config, [staleEid()]);

    const eids = cachedEids();
    expect(eids[0].uids).toEqual([{ atype: 3, id: BODY.advertising_token }]);
    expect(eids[0]._ref).toEqual(BODY);
    expect(eids[1].source).toBe("other.com");
    expect(events).toHaveLength(1);
  });

  it("removes the token on an opt-out", async () => {
    seedCache();
    respondWith(await encryptResponse({ status: "optout" }));

    await refreshStaleUid2s(config, [staleEid()]);

    expect(cachedEids().map((e) => e.source)).toEqual(["other.com"]);
    expect(events).toHaveLength(1);
  });

  it("skips EIDs without usable ref data", async () => {
    seedCache();

    await refreshStaleUid2s(config, [{ source: "uidapi.com" }]);

    expect(cachedEids().map((e) => e.source)).toEqual(["uidapi.com", "other.com"]);
    expect(events).toHaveLength(0);
  });

  it("does not throw on a network failure and leaves the cache untouched", async () => {
    seedCache();
    server.use(http.post(UID2_REFRESH_ENDPOINT, () => HttpResponse.error()));

    await expect(refreshStaleUid2s(config, [staleEid()])).resolves.toBeUndefined();

    expect(cachedEids().map((e) => e.source)).toEqual(["uidapi.com", "other.com"]);
    expect(events).toHaveLength(0);
  });

  it("does not throw on an undecryptable response and leaves the cache untouched", async () => {
    seedCache();
    respondWith(Buffer.from(webcrypto.getRandomValues(new Uint8Array(64))).toString("base64"));

    await expect(refreshStaleUid2s(config, [staleEid()])).resolves.toBeUndefined();

    expect(cachedEids().map((e) => e.source)).toEqual(["uidapi.com", "other.com"]);
    expect(events).toHaveLength(0);
  });

  it("is a no-op for an empty list", async () => {
    await expect(refreshStaleUid2s(config, [])).resolves.toBeUndefined();
    expect(events).toHaveLength(0);
  });
});
