import { clearOISID, getOISID, getOISState, oisHeaderName, oisRequestID, readOISHeader } from "./ois";
import { buildRequest } from "./network";
import { generateOISKeys } from "./storage-keys";
import { TEST_HOST, TEST_SITE } from "../test/mocks";
import type { ResolvedConfig } from "../config";

const baseConfig = {
  host: TEST_HOST,
  site: TEST_SITE,
  cookies: true,
  ois: true,
  consent: { deviceAccess: true },
} as unknown as ResolvedConfig;

const storageKey = generateOISKeys(baseConfig).write[0];

// Every endpoint where the node derives an OIS id, and therefore returns
// the header and accepts a replayed one.
const HEADER_PATHS = ["/identify", "/uid2/token", "/sync", "/profile", "/v2/targeting"];

// /config runs during SDK init and /witness records an event without deriving an
// id, so neither returns the header. Sending it there would buy a CORS preflight
// for nothing.
const NON_HEADER_PATHS = ["/config", "/witness", "/targeting", "/v1/resolve", "/v2/tokenize"];

function withHeader(id?: string): Headers {
  const headers = new Headers();
  if (id !== undefined) {
    headers.set(oisHeaderName, id);
  }
  return headers;
}

function stored(): string | null {
  return window.localStorage.getItem(storageKey);
}

beforeEach(() => {
  window.localStorage.clear();
  jest.clearAllMocks();
});

describe("readOISHeader", () => {
  it("stores the id the node returned", () => {
    readOISHeader(baseConfig, "/identify", withHeader("ois-id-1"));

    expect(stored()).toBe("ois-id-1");
    expect(getOISID(baseConfig)).toBe("ois-id-1");
  });

  it.each(HEADER_PATHS)("stores on %s", (path) => {
    readOISHeader(baseConfig, path, withHeader("ois-id-1"));

    expect(stored()).toBe("ois-id-1");
  });

  // The read side is filtered by the same path set as the send side. A node that
  // sets the header somewhere it derives no id is not a reason to store one.
  it.each(NON_HEADER_PATHS)("ignores a header returned on %s", (path) => {
    readOISHeader(baseConfig, path, withHeader("unexpected"));

    expect(stored()).toBeNull();
  });

  it.each(NON_HEADER_PATHS)("leaves a stored id alone on %s", (path) => {
    readOISHeader(baseConfig, "/identify", withHeader("keep-me"));

    readOISHeader(baseConfig, path, withHeader("unexpected"));

    expect(stored()).toBe("keep-me");
  });

  // The node hands back the id derived for the current request, not the one the
  // client replayed, so drifting signals roll the stored value forward.
  // There is no policy to apply and nothing to reconcile.
  it("overwrites an existing id", () => {
    readOISHeader(baseConfig, "/identify", withHeader("ois-id-1"));
    readOISHeader(baseConfig, "/identify", withHeader("ois-id-2"));

    expect(stored()).toBe("ois-id-2");
  });

  // The node omits the header on endpoints that derive no id, and on requests it
  // declines to derive for (non-residential IP, or ID derivation switched off).
  // None of those mean "forget the id you have".
  it.each([
    ["absent", undefined],
    ["empty", ""],
  ])("leaves the stored id alone when the header is %s", (_label, value) => {
    readOISHeader(baseConfig, "/identify", withHeader("keep-me"));

    readOISHeader(baseConfig, "/identify", withHeader(value as string | undefined));

    expect(stored()).toBe("keep-me");
  });

  it("does not rewrite storage when the id is unchanged", () => {
    readOISHeader(baseConfig, "/identify", withHeader("same-id"));
    jest.clearAllMocks();

    readOISHeader(baseConfig, "/identify", withHeader("same-id"));

    expect(window.localStorage.setItem).not.toHaveBeenCalled();
  });

  it("stores nothing without device access consent", () => {
    const config = { ...baseConfig, consent: { deviceAccess: false } } as ResolvedConfig;

    readOISHeader(config, "/identify", withHeader("no-consent"));

    expect(stored()).toBeNull();
  });

  it("dispatches optable-ois:change when the id changes", () => {
    const listener = jest.fn();
    window.addEventListener("optable-ois:change", listener);

    readOISHeader(baseConfig, "/identify", withHeader("ois-id-1"));

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0].detail).toMatchObject({ id: "ois-id-1", storageKey });

    window.removeEventListener("optable-ois:change", listener);
  });
});

describe("oisRequestID", () => {
  beforeEach(() => window.localStorage.setItem(storageKey, "stored-id"));

  it.each(HEADER_PATHS)("replays on %s", (path) => {
    expect(oisRequestID(baseConfig, path)).toBe("stored-id");
  });

  it.each(NON_HEADER_PATHS)("does not replay on %s", (path) => {
    expect(oisRequestID(baseConfig, path)).toBeNull();
  });

  it("returns null when nothing is stored", () => {
    window.localStorage.clear();

    expect(oisRequestID(baseConfig, "/identify")).toBeNull();
  });
});

describe("buildRequest", () => {
  it.each(HEADER_PATHS)("sends the stored id on %s", (path) => {
    window.localStorage.setItem(storageKey, "send-me");

    const request = buildRequest(path, baseConfig, { method: "POST" });

    expect(request.headers.get(oisHeaderName)).toBe("send-me");
  });

  it.each(NON_HEADER_PATHS)("does not send on %s", (path) => {
    window.localStorage.setItem(storageKey, "send-me");

    const request = buildRequest(path, baseConfig, { method: "GET" });

    expect(request.headers.get(oisHeaderName)).toBeNull();
  });

  it.each([
    ["not opted in", { ois: undefined }],
    ["no device access consent", { consent: { deviceAccess: false } }],
  ])("does not send when %s", (_label, override) => {
    window.localStorage.setItem(storageKey, "send-me");
    const config = { ...baseConfig, ...override } as unknown as ResolvedConfig;

    const request = buildRequest("/identify", config, { method: "POST" });

    expect(request.headers.get(oisHeaderName)).toBeNull();
  });

  // The id travels on a header in both directions; there is no query-param
  // counterpart, and adding one would break the exact-URL assertions elsewhere.
  it("never adds an ois query param", () => {
    window.localStorage.setItem(storageKey, "send-me");

    const request = buildRequest("/identify", baseConfig, { method: "POST" });

    expect(new URL(request.url).searchParams.has("ois")).toBe(false);
  });

  it("preserves headers the caller supplied", () => {
    window.localStorage.setItem(storageKey, "send-me");

    const request = buildRequest("/identify", baseConfig, {
      method: "POST",
      headers: { Accept: "application/json" },
    });

    expect(request.headers.get("Accept")).toBe("application/json");
    expect(request.headers.get(oisHeaderName)).toBe("send-me");
  });
});

// The round trip is the actual contract: an id returned on one response is
// replayed on the next request.
//
// Note this cannot catch the real-world CORS dependency — jsdom does not enforce
// Access-Control-Expose-Headers, so the header is readable here even though a
// browser needs the node to expose it explicitly.
describe("round trip", () => {
  it("replays an id received on a response", () => {
    readOISHeader(baseConfig, "/identify", withHeader("round-trip-id"));

    const request = buildRequest("/v2/targeting", baseConfig, { method: "GET" });

    expect(request.headers.get(oisHeaderName)).toBe("round-trip-id");
  });
});

describe("getOISState", () => {
  it("reports the stored id and its key", () => {
    window.localStorage.setItem(storageKey, "an-id");

    expect(getOISState(baseConfig)).toEqual({ id: "an-id", storageKey });
    expect(storageKey).toContain("OPTABLE_OIS_");
  });

  it("reports a null id when nothing is stored", () => {
    expect(getOISState(baseConfig)).toEqual({ id: null, storageKey });
  });
});

describe("clearOISID", () => {
  it("forgets the stored id", () => {
    window.localStorage.setItem(storageKey, "forget-me");

    clearOISID(baseConfig);

    expect(stored()).toBeNull();
    expect(getOISID(baseConfig)).toBeNull();
  });
});
