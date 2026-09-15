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
