import { identifyAndTokenize } from "./identify-tokenize";
import { resetFlags } from "./flags";
import OptableSDK from "../sdk";
import { TEST_HOST, TEST_SITE } from "../test/mocks";

const TOKENIZE_RESPONSE = { user: { eids: [{ source: "uidapi.com", uids: [{ id: "tokenized" }] }] } };

function makeSdk() {
  const sdk = new OptableSDK({ host: TEST_HOST, site: TEST_SITE });
  const identify = jest.spyOn(sdk, "identify").mockResolvedValue(undefined);
  const tokenize = jest.spyOn(sdk, "tokenize").mockResolvedValue(TOKENIZE_RESPONSE as any);
  return { sdk, identify, tokenize };
}

function cachedEids() {
  return JSON.parse(localStorage.getItem("OPTABLE_RESOLVED") || "null")?.ortb2?.user?.eids ?? [];
}

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  resetFlags();
});

describe("identifyAndTokenize", () => {
  it("prefixes a bare id with e: and passes prefixed ids through", async () => {
    const { sdk, identify } = makeSdk();
    await identifyAndTokenize(sdk, "abc123");
    expect(identify).toHaveBeenCalledWith("e:abc123");

    sessionStorage.clear();
    await identifyAndTokenize(sdk, "c:custom-id");
    expect(identify).toHaveBeenLastCalledWith("c:custom-id");

    sessionStorage.clear();
    await identifyAndTokenize(sdk, "utiq:xyz");
    expect(identify).toHaveBeenLastCalledWith("utiq:xyz");
  });

  it("tokenizes and merges the response into the cache, announcing the change", async () => {
    const { sdk } = makeSdk();
    const events: Event[] = [];
    const listener = (e: Event) => events.push(e);
    window.addEventListener("optable-targeting:change", listener);

    const result = await identifyAndTokenize(sdk, "abc123");

    window.removeEventListener("optable-targeting:change", listener);
    expect(result?.merged.ortb2?.user?.eids).toHaveLength(1);
    expect(cachedEids().map((e: any) => e.source)).toEqual(["uidapi.com"]);
    expect(events).toHaveLength(1);
  });

  it("merges into an existing cache instead of overwriting it", async () => {
    localStorage.setItem(
      "OPTABLE_RESOLVED",
      JSON.stringify({ ortb2: { user: { data: [], eids: [{ source: "id5-sync.com", uids: [{ id: "id5" }] }] } } })
    );
    const { sdk } = makeSdk();

    await identifyAndTokenize(sdk, "abc123");

    expect(
      cachedEids()
        .map((e: any) => e.source)
        .sort()
    ).toEqual(["id5-sync.com", "uidapi.com"]);
  });

  it("skips tokenize in the control group but still identifies", async () => {
    const { sdk, identify, tokenize } = makeSdk();

    const result = await identifyAndTokenize(sdk, "abc123", { isControlGroup: () => true });

    expect(identify).toHaveBeenCalled();
    expect(tokenize).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it("runs once per session, re-runnable with optableForceTokenize", async () => {
    const { sdk, identify } = makeSdk();
    await identifyAndTokenize(sdk, "abc123");
    await identifyAndTokenize(sdk, "abc123");
    expect(identify).toHaveBeenCalledTimes(1);

    sessionStorage.setItem("optableForceTokenize", "1");
    resetFlags();
    await identifyAndTokenize(sdk, "abc123");
    expect(identify).toHaveBeenCalledTimes(2);
  });

  it("resets the session guard when tokenize fails, so a later call retries", async () => {
    const { sdk, tokenize } = makeSdk();
    tokenize.mockRejectedValueOnce(new Error("edge down"));

    const result = await identifyAndTokenize(sdk, "abc123");

    expect(result).toBeNull();
    expect(sessionStorage.getItem("OPTABLE_TOKENIZE_DONE")).toBeNull();

    await identifyAndTokenize(sdk, "abc123");
    expect(cachedEids()).toHaveLength(1);
  });

  it("does nothing without an id", async () => {
    const { sdk, identify } = makeSdk();
    expect(await identifyAndTokenize(sdk, "")).toBeNull();
    expect(identify).not.toHaveBeenCalled();
  });
});

describe("identifyAndTokenize - failure paths and options", () => {
  it("swallows an identify rejection instead of leaking an unhandled one", async () => {
    const { sdk, identify } = makeSdk();
    identify.mockRejectedValueOnce(new Error("network"));

    // Resolves normally, and the rejection never escapes the module.
    await expect(identifyAndTokenize(sdk, "abc123")).resolves.not.toBeNull();
    // identify failing does not reopen the tokenize guard: tokenize succeeded.
    expect(sessionStorage.getItem("OPTABLE_TOKENIZE_DONE")).not.toBeNull();
  });

  it("takes an id that is not URI-encoded as given", async () => {
    const { sdk, identify } = makeSdk();

    // decodeURIComponent throws on a bare %.
    await expect(identifyAndTokenize(sdk, "100%")).resolves.not.toBeNull();
    expect(identify).toHaveBeenCalledWith("e:100%");
  });

  it("replaces a corrupt cache instead of failing every later call", async () => {
    localStorage.setItem("OPTABLE_RESOLVED", "{not json");
    const { sdk } = makeSdk();

    const result = await identifyAndTokenize(sdk, "abc123");

    expect(result).not.toBeNull();
    expect(cachedEids().map((e: { source: string }) => e.source)).toEqual(["uidapi.com"]);
    // The guard holds, so a second call does not repeat both requests.
    expect(sessionStorage.getItem("OPTABLE_TOKENIZE_DONE")).not.toBeNull();
  });

  it("honours cacheKey and maxUidsPerEid", async () => {
    const { sdk, tokenize } = makeSdk();
    tokenize.mockResolvedValue({
      user: { eids: [{ source: "uidapi.com", uids: [{ id: "a" }, { id: "b" }, { id: "c" }] }] },
    } as any);

    await identifyAndTokenize(sdk, "abc123", { cacheKey: "CUSTOM_CACHE", maxUidsPerEid: 1 });

    expect(localStorage.getItem("OPTABLE_RESOLVED")).toBeNull();
    const eids = JSON.parse(localStorage.getItem("CUSTOM_CACHE") || "null")?.ortb2?.user?.eids;
    expect(eids[0].uids).toHaveLength(1);
  });

  it("returns the stale UID2s the merge found, for the refresh loop to chain on", async () => {
    localStorage.setItem(
      "OPTABLE_RESOLVED",
      JSON.stringify({
        ortb2: { user: { eids: [{ source: "uidapi.com", uids: [{ id: "cached" }] }] } },
        refs: {
          "uidapi.com": {
            advertising_token: "adv",
            refresh_token: "rt",
            refresh_response_key: "rk",
            refresh_from: Date.now() - 1000,
            refresh_expires: Date.now() + 60_000,
            identity_expires: Date.now() + 60_000,
          },
        },
      })
    );
    const { sdk, tokenize } = makeSdk();
    // Tokenize fills a different source, so the stale cached UID2 carries over.
    tokenize.mockResolvedValue({ user: { eids: [{ source: "liveramp.com", uids: [{ id: "lr" }] }] } } as any);

    const result = await identifyAndTokenize(sdk, "abc123");

    expect(result?.staleUid2s.map((s) => s.source)).toEqual(["uidapi.com"]);
  });
});

describe("identifyAndTokenize - guard keying", () => {
  it("resolves a different id in the same session", async () => {
    const { sdk, tokenize } = makeSdk();

    await identifyAndTokenize(sdk, "first@example");
    await identifyAndTokenize(sdk, "second@example");

    expect(tokenize).toHaveBeenNthCalledWith(1, "e:first@example");
    expect(tokenize).toHaveBeenNthCalledWith(2, "e:second@example");
  });

  it("stores a fingerprint of the id, never the id", async () => {
    const { sdk } = makeSdk();

    await identifyAndTokenize(sdk, "e:0123456789abcdef");

    const guard = sessionStorage.getItem("OPTABLE_TOKENIZE_DONE");
    expect(guard).not.toBeNull();
    expect(guard).not.toContain("0123456789abcdef");
  });

  it("prefixes an id whose colon is not a short alphanumeric prefix", async () => {
    const { sdk, identify } = makeSdk();

    // /utiq:/ unanchored used to let this through unprefixed.
    await identifyAndTokenize(sdk, "xutiq:abc");

    expect(identify).toHaveBeenCalledWith("e:xutiq:abc");
  });
});

describe("identifyAndTokenize - guard resilience", () => {
  it("still resolves when sessionStorage throws", async () => {
    const getItem = jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    const setItem = jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });

    try {
      const { sdk } = makeSdk();
      await expect(identifyAndTokenize(sdk, "abc123")).resolves.not.toBeNull();
    } finally {
      getItem.mockRestore();
      setItem.mockRestore();
    }
  });

  it("a failing call does not reopen a guard a later id already claimed", async () => {
    const { sdk, tokenize } = makeSdk();

    // First call hangs, so the second claims the guard while it is in flight.
    let failFirst: (err: Error) => void = () => {};
    tokenize.mockReturnValueOnce(new Promise((_, reject) => (failFirst = reject)) as any);

    const first = identifyAndTokenize(sdk, "first@example");
    await identifyAndTokenize(sdk, "second@example");
    const claimed = sessionStorage.getItem("OPTABLE_TOKENIZE_DONE");

    failFirst(new Error("boom"));
    await first;

    expect(sessionStorage.getItem("OPTABLE_TOKENIZE_DONE")).toBe(claimed);
  });
});
