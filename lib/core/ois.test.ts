import { applyOISResponse, getOISState, oisRequestID, parseEnvelope, shouldStore } from "./ois";
import { buildRequest } from "./network";
import { generateOISKeys } from "./storage-keys";
import type { ResolvedConfig } from "../config";

const baseConfig = {
  host: "hostmock.com",
  site: "site",
  cookies: true,
  ois: true,
  consent: { deviceAccess: true },
} as unknown as ResolvedConfig;

const storageKey = generateOISKeys(baseConfig).write[0];

function stored(): { id: string; source: string } | null {
  const raw = window.localStorage.getItem(storageKey);
  return raw ? JSON.parse(raw) : null;
}

function seed(id: string, source: string) {
  window.localStorage.setItem(storageKey, JSON.stringify({ v: 1, id, source, ts: 1 }));
}

beforeEach(() => {
  window.localStorage.clear();
  jest.clearAllMocks();
});

// The write policy is the whole reason the module does not churn the stored id.
// A minted id arrives on every request to an endpoint that does not replay the
// header (notably /config, on every page load), so treating a mint as
// authoritative would replace a good cookie-backed id constantly.
describe("shouldStore", () => {
  const existing = { v: 1, id: "existing", source: "cookie" as const, ts: 1 };

  it("always stores a cookie-sourced id", () => {
    expect(shouldStore("cookie", null)).toBe(true);
    expect(shouldStore("cookie", existing)).toBe(true);
  });

  it("never stores a header-sourced id, which is the one just sent", () => {
    expect(shouldStore("header", null)).toBe(false);
    expect(shouldStore("header", existing)).toBe(false);
  });

  it("only lets a minted id bootstrap an empty slot", () => {
    expect(shouldStore("minted", null)).toBe(true);
    expect(shouldStore("minted", existing)).toBe(false);
  });
});

// A hand-edited or truncated value must read as absent rather than throw on
// every request for the life of the browser profile.
describe("parseEnvelope", () => {
  it("reads a well-formed envelope", () => {
    expect(parseEnvelope('{"v":1,"id":"abc","source":"cookie","ts":7}')).toEqual({
      v: 1,
      id: "abc",
      source: "cookie",
      ts: 7,
    });
  });

  it.each([
    ["null input", null],
    ["empty string", ""],
    ["not json", "not-json"],
    ["a bare legacy string", '"just-an-id"'],
    ["json without an id", '{"v":1,"source":"cookie"}'],
    ["an empty id", '{"v":1,"id":"","source":"cookie"}'],
  ])("treats %s as absent", (_label, raw) => {
    expect(parseEnvelope(raw as string | null)).toBeNull();
  });

  it("falls back to minted for an unrecognized source so the id is not trusted as a cookie", () => {
    expect(parseEnvelope('{"v":1,"id":"abc","source":"wat","ts":7}')?.source).toBe("minted");
  });
});

describe("applyOISResponse", () => {
  it("stores a cookie-sourced id and strips both fields from the payload", () => {
    const data: Record<string, unknown> = { ois_id: "cookie-id", oid_source: "cookie", audience: [] };

    applyOISResponse(baseConfig, data);

    expect(stored()).toMatchObject({ id: "cookie-id", source: "cookie" });
    expect(data).toEqual({ audience: [] });
  });

  it("overwrites a bootstrapped id once the cookie transport reports one", () => {
    seed("bootstrap-id", "minted");

    applyOISResponse(baseConfig, { ois_id: "real-cookie-id", oid_source: "cookie" });

    expect(stored()).toMatchObject({ id: "real-cookie-id", source: "cookie" });
  });

  it("bootstraps from a minted id when nothing is stored", () => {
    applyOISResponse(baseConfig, { ois_id: "minted-id", oid_source: "minted" });

    expect(stored()).toMatchObject({ id: "minted-id", source: "minted" });
  });

  // Without this guard every /config call would replace the id, so the browser
  // would present a new identity on each page load.
  it("does not let a minted id replace a stored one", () => {
    seed("keep-me", "cookie");

    applyOISResponse(baseConfig, { ois_id: "throwaway", oid_source: "minted" });

    expect(stored()).toMatchObject({ id: "keep-me" });
  });

  it("does not rewrite storage when the cookie reports the id already held", () => {
    seed("same-id", "cookie");
    jest.clearAllMocks();

    applyOISResponse(baseConfig, { ois_id: "same-id", oid_source: "cookie" });

    expect(window.localStorage.setItem).not.toHaveBeenCalled();
  });

  // The fields ride on /v2/targeting and /config payloads, which are handed to
  // ad servers and written to the targeting cache.
  it("strips the fields even when nothing is stored", () => {
    const data: Record<string, unknown> = { ois_id: "x", oid_source: "header", keywords: ["a"] };

    applyOISResponse(baseConfig, data);

    expect(data).toEqual({ keywords: ["a"] });
  });

  it("strips the fields when the source is unusable", () => {
    const data: Record<string, unknown> = { ois_id: "x", oid_source: "nonsense" };

    applyOISResponse(baseConfig, data);

    expect(data).toEqual({});
    expect(stored()).toBeNull();
  });

  it("stores nothing without device access consent", () => {
    const config = { ...baseConfig, consent: { deviceAccess: false } } as ResolvedConfig;
    const data: Record<string, unknown> = { ois_id: "no-consent", oid_source: "cookie" };

    applyOISResponse(config, data);

    expect(stored()).toBeNull();
    expect(data).toEqual({});
    expect(getOISState(config).storageWritable).toBe(false);
  });
});

describe("oisRequestID", () => {
  beforeEach(() => seed("stored-id", "cookie"));

  it.each(["/identify", "/sync", "/uid2/token", "/v2/targeting", "/witness", "/profile"])("replays on %s", (path) => {
    expect(oisRequestID(baseConfig, path)).toBe("stored-id");
  });

  // A custom header makes the request non-simple, so replaying on /config would
  // add a CORS preflight to the SDK init path on every page load.
  it.each(["/config", "/v1/resolve", "/v2/tokenize", "/v1beta1/contextual"])("does not replay on %s", (path) => {
    expect(oisRequestID(baseConfig, path)).toBeNull();
  });

  it("returns null when nothing is stored", () => {
    window.localStorage.clear();
    expect(oisRequestID(baseConfig, "/identify")).toBeNull();
  });
});

// transport is what the demo reports. A mint means the node saw neither a cookie
// nor a header, which happens both on a first visit and when the cookie is
// blocked -- indistinguishable from the browser, so it must not claim either.
describe("getOISState transport", () => {
  it.each([
    ["cookie", "cookie"],
    ["header", "localstorage"],
    ["minted", "unknown"],
  ])("reports %s as %s", (source, transport) => {
    seed("an-id", source);
    expect(getOISState(baseConfig).transport).toBe(transport);
  });

  it("reports unknown with nothing stored", () => {
    expect(getOISState(baseConfig)).toMatchObject({ id: null, source: null, transport: "unknown" });
  });

  it("exposes the storage key in use", () => {
    expect(getOISState(baseConfig).storageKey).toBe(storageKey);
    expect(storageKey).toContain("OPTABLE_OIS_");
  });
});

describe("buildRequest OIS opt-in param", () => {
  // The DCN returns the id only to a caller that asks for it, and the first
  // response is what bootstraps storage — so the param must be sent even on
  // endpoints that do not replay the header, and before anything is stored.
  it.each(["/config", "/identify", "/v2/targeting"])("opts in on %s", (path) => {
    const request = buildRequest(path, baseConfig, { method: "GET" });

    expect(new URL(request.url).searchParams.get("ois")).toBe("1");
  });

  it("opts in with nothing stored yet, so the id can bootstrap", () => {
    const request = buildRequest("/config", baseConfig, { method: "GET" });

    expect(new URL(request.url).searchParams.get("ois")).toBe("1");
    expect(request.headers.get("X-Optable-OID")).toBeNull();
  });

  it("does not opt in unless enabled", () => {
    const config = { ...baseConfig, ois: undefined } as unknown as ResolvedConfig;

    const request = buildRequest("/identify", config, { method: "POST" });

    expect(new URL(request.url).searchParams.has("ois")).toBe(false);
  });

  it("does not opt in without device access consent", () => {
    const config = { ...baseConfig, consent: { deviceAccess: false } } as ResolvedConfig;

    const request = buildRequest("/identify", config, { method: "POST" });

    expect(new URL(request.url).searchParams.has("ois")).toBe(false);
  });
});

describe("buildRequest OIS header", () => {
  it("sends a stored id on a replay path", () => {
    seed("send-me", "cookie");

    const request = buildRequest("/identify", baseConfig, { method: "POST" });

    expect(request.headers.get("X-Optable-OID")).toBe("send-me");
  });

  it("does not send on /config", () => {
    seed("send-me", "cookie");

    const request = buildRequest("/config", baseConfig, { method: "GET" });

    expect(request.headers.get("X-Optable-OID")).toBeNull();
  });

  it("does not send unless opted in", () => {
    seed("send-me", "cookie");
    const config = { ...baseConfig, ois: undefined } as unknown as ResolvedConfig;

    const request = buildRequest("/identify", config, { method: "POST" });

    expect(request.headers.get("X-Optable-OID")).toBeNull();
  });

  it("does not send without device access consent", () => {
    seed("send-me", "cookie");
    const config = { ...baseConfig, consent: { deviceAccess: false } } as ResolvedConfig;

    const request = buildRequest("/identify", config, { method: "POST" });

    expect(request.headers.get("X-Optable-OID")).toBeNull();
  });

  it("still resolves the path when a query string is already present", () => {
    seed("send-me", "cookie");

    const request = buildRequest("/v2/targeting?id=c%3Aabc", baseConfig, { method: "GET" });

    expect(request.headers.get("X-Optable-OID")).toBe("send-me");
  });
});
