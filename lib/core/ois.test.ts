import { clearOISID, getOISID, getOISState, oisHeaderName, oisRequestID, readOISHeader } from "./ois";
import { buildRequest, fetch as sdkFetch } from "./network";
import { generateOISKeys } from "./storage-keys";
import { TEST_BASE_URL, TEST_HOST, TEST_SITE } from "../test/mocks";
import { server } from "../test/server";
import { http, HttpResponse } from "msw";
import type { ResolvedConfig } from "../config";

const baseConfig = {
  host: TEST_HOST,
  site: TEST_SITE,
  cookies: true,
  ois: true,
  consent: { deviceAccess: true },
} as unknown as ResolvedConfig;

const storageKey = generateOISKeys(baseConfig).write[0];

const PATHS = ["/config", "/identify", "/profile", "/v2/targeting", "/v2/tokenize", "/witness"];

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
    readOISHeader(baseConfig, withHeader("ois-id-1"));

    expect(stored()).toBe("ois-id-1");
    expect(getOISID(baseConfig)).toBe("ois-id-1");
  });

  // The node returns the id derived for the current request, not the one replayed.
  it("overwrites an existing id", () => {
    readOISHeader(baseConfig, withHeader("ois-id-1"));
    readOISHeader(baseConfig, withHeader("ois-id-2"));

    expect(stored()).toBe("ois-id-2");
  });

  it.each([
    ["absent", undefined],
    ["empty", ""],
  ])("leaves the stored id alone when the header is %s", (_label, value) => {
    readOISHeader(baseConfig, withHeader("keep-me"));

    readOISHeader(baseConfig, withHeader(value as string | undefined));

    expect(stored()).toBe("keep-me");
  });

  it("does not rewrite storage when the id is unchanged", () => {
    readOISHeader(baseConfig, withHeader("same-id"));
    jest.clearAllMocks();

    readOISHeader(baseConfig, withHeader("same-id"));

    expect(window.localStorage.setItem).not.toHaveBeenCalled();
  });

  it("stores nothing without device access consent", () => {
    const config = { ...baseConfig, consent: { deviceAccess: false } } as ResolvedConfig;

    readOISHeader(config, withHeader("no-consent"));

    expect(stored()).toBeNull();
  });

  it("dispatches optable-ois:change when the id changes", () => {
    const listener = jest.fn();
    window.addEventListener("optable-ois:change", listener);

    readOISHeader(baseConfig, withHeader("ois-id-1"));

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0].detail).toMatchObject({ id: "ois-id-1", storageKey });

    window.removeEventListener("optable-ois:change", listener);
  });
});

describe("oisRequestID", () => {
  beforeEach(() => window.localStorage.setItem(storageKey, "stored-id"));

  it("returns the stored id", () => {
    expect(oisRequestID(baseConfig)).toBe("stored-id");
  });

  it("returns null when nothing is stored", () => {
    window.localStorage.clear();

    expect(oisRequestID(baseConfig)).toBeNull();
  });
});

describe("buildRequest", () => {
  it.each(PATHS)("sends the stored id on %s", (path) => {
    window.localStorage.setItem(storageKey, "send-me");

    const request = buildRequest(path, baseConfig, { method: "POST" });

    expect(request.headers.get(oisHeaderName)).toBe("send-me");
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

  // Guards against reintroducing the abandoned ois=1 param design.
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

// Cannot catch the real CORS dependency: jsdom does not enforce
// Access-Control-Expose-Headers, which a browser needs the node to set.
describe("fetch", () => {
  function replyWith(path: string, id?: string) {
    server.use(
      http.post(`${TEST_BASE_URL}${path}`, () =>
        HttpResponse.json({}, { status: 200, headers: id === undefined ? {} : { [oisHeaderName]: id } })
      )
    );
  }

  it("stores an id returned on the response header", async () => {
    replyWith("/identify", "from-fetch");

    await sdkFetch("/identify", baseConfig, { method: "POST" });

    expect(stored()).toBe("from-fetch");
  });

  it("leaves the stored id alone when the response carries no header", async () => {
    window.localStorage.setItem(storageKey, "keep-me");
    replyWith("/identify");

    await sdkFetch("/identify", baseConfig, { method: "POST" });

    expect(stored()).toBe("keep-me");
  });

  it.each(PATHS)("stores an id returned on %s", async (path) => {
    replyWith(path, "from-fetch");

    await sdkFetch(path, baseConfig, { method: "POST" });

    expect(stored()).toBe("from-fetch");
  });

  it("does not read the header when not opted in", async () => {
    replyWith("/identify", "from-fetch");

    await sdkFetch("/identify", { ...baseConfig, ois: undefined } as unknown as ResolvedConfig, { method: "POST" });

    expect(stored()).toBeNull();
  });

  // The round trip is the actual contract: an id read off one response is
  // replayed on the next request.
  it("replays an id received on a previous response", async () => {
    replyWith("/identify", "round-trip-id");

    await sdkFetch("/identify", baseConfig, { method: "POST" });
    const request = buildRequest("/profile", baseConfig, { method: "POST" });

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
