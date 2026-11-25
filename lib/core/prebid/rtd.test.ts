import { targetingEventName } from "../events/cache-refresh";
import { buildRTD } from "./rtd";
import type { ReqBidsConfigObj } from "./rtd";
import type { ContextualSegmentsResponse } from "../../edge/contextual_segments";

const EIDS = [{ source: "uidapi.com", uids: [{ id: "uid2-token" }] }];

type PrebidStub = { getConfig: () => unknown };
const w = window as unknown as { pbjs?: PrebidStub; asc?: PrebidStub };

function bidsConfig(): ReqBidsConfigObj {
  return { ortb2Fragments: { global: {}, bidder: {} } };
}

function globalEids(req: ReqBidsConfigObj) {
  return req.ortb2Fragments.global.user?.ext?.eids ?? [];
}

function seedCache(eids: unknown[]) {
  localStorage.setItem("OPTABLE_RESOLVED", JSON.stringify({ ortb2: { user: { eids } } }));
}

function withAuctionDelay(ms?: number): PrebidStub {
  return { getConfig: () => ({ realTimeData: { auctionDelay: ms } }) };
}

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  w.pbjs = withAuctionDelay(500);
  delete w.asc;
});

describe("buildRTD - waitForTargeting", () => {
  it("serves immediately when the cache already has EIDs", async () => {
    seedCache(EIDS);
    const req = bidsConfig();

    await buildRTD({ waitForTargeting: true }).handleRtd(req);

    expect(globalEids(req)).toHaveLength(1);
  });

  it("waits for the targeting update event and merges the cache it announces", async () => {
    const req = bidsConfig();
    const pending = buildRTD({ waitForTargeting: true }).handleRtd(req);

    seedCache(EIDS);
    window.dispatchEvent(new CustomEvent(targetingEventName));
    await pending;

    expect(globalEids(req)).toHaveLength(1);
  });

  it("gives up after the auction delay when no event arrives", async () => {
    w.pbjs = { getConfig: () => ({ realTimeData: { auctionDelay: 20 } }) };
    const req = bidsConfig();

    await buildRTD({ waitForTargeting: true }).handleRtd(req);

    expect(globalEids(req)).toHaveLength(0);
  });

  it("does not wait when waitForTargeting is off", async () => {
    const req = bidsConfig();

    await buildRTD().handleRtd(req);

    expect(globalEids(req)).toHaveLength(0);
  });

  it("waits when the cache exists but has no EIDs", async () => {
    seedCache([]);
    const req = bidsConfig();
    const pending = buildRTD({ waitForTargeting: true }).handleRtd(req);

    seedCache(EIDS);
    window.dispatchEvent(new CustomEvent(targetingEventName));
    await pending;

    expect(globalEids(req)).toHaveLength(1);
  });
});

describe("buildRTD - prebidGlobal", () => {
  it("takes the auction delay from the named global", async () => {
    delete w.pbjs;
    w.asc = withAuctionDelay(500);
    const req = bidsConfig();

    const pending = buildRTD({ waitForTargeting: true, prebidGlobal: "asc" }).handleRtd(req);
    seedCache(EIDS);
    window.dispatchEvent(new CustomEvent(targetingEventName));
    await pending;

    expect(globalEids(req)).toHaveLength(1);
  });

  it("does not wait when only another instance declares the delay", async () => {
    delete w.pbjs;
    w.asc = withAuctionDelay(500);
    const req = bidsConfig();

    // Seeding after the call: only a wait would pick these up.
    const pending = buildRTD({ waitForTargeting: true }).handleRtd(req);
    seedCache(EIDS);
    window.dispatchEvent(new CustomEvent(targetingEventName));
    await pending;

    expect(globalEids(req)).toHaveLength(0);
  });

  it("still defaults to pbjs", async () => {
    w.asc = withAuctionDelay(500);
    const req = bidsConfig();

    const pending = buildRTD({ waitForTargeting: true }).handleRtd(req);
    seedCache(EIDS);
    window.dispatchEvent(new CustomEvent(targetingEventName));
    await pending;

    expect(globalEids(req)).toHaveLength(1);
  });

  it("warns when the named global declares no delay", async () => {
    w.pbjs = withAuctionDelay(undefined);
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    const req = bidsConfig();

    await buildRTD({ waitForTargeting: true, enableLogging: true }).handleRtd(req);

    expect(warn.mock.calls.flat().join(" ")).toContain("no realTimeData.auctionDelay");
    warn.mockRestore();
  });

  it("warns that the named global is missing when it does not exist", async () => {
    delete w.pbjs;
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    const req = bidsConfig();

    await buildRTD({ waitForTargeting: true, enableLogging: true, prebidGlobal: "asc" }).handleRtd(req);

    expect(warn.mock.calls.flat().join(" ")).toContain("window.asc is not defined");
    warn.mockRestore();
  });

  it("does not warn when the cache already has EIDs", async () => {
    delete w.pbjs;
    seedCache(EIDS);
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    const req = bidsConfig();

    await buildRTD({ waitForTargeting: true, enableLogging: true }).handleRtd(req);

    expect(warn.mock.calls.flat().join(" ")).not.toContain("serving this auction unenriched");
    warn.mockRestore();
  });
});

const CONTEXTUAL = {
  classifications: {
    categories: [{ id: "53", name: "Business", score: 0.9, taxonomy: "iab_ct_3_1" }],
    keywords: [{ keyword: "earnings", prominence: 1 }],
  },
} as ContextualSegmentsResponse;

const CONTEXTUAL_SITE = {
  content: {
    data: [{ name: "optable.co", ext: { segtax: 9 }, segment: [{ id: "53" }] }],
    keywords: "earnings",
  },
};

const o = window as unknown as { optable?: Record<string, unknown> };

// Stands in for the SDK instance the RTD config names.
function fakeInstance(cached: ContextualSegmentsResponse | null, url = window.location.href) {
  return { ctxSegmentsFromCache: (requested?: string) => (requested === url ? cached : null) };
}

describe("buildRTD - contextual", () => {
  afterEach(() => {
    delete o.optable;
  });

  it("serves no contextual data unless the wrapper enables it", async () => {
    let read = false;
    o.optable = {
      instance: { ctxSegmentsFromCache: () => ((read = true), CONTEXTUAL) },
    };
    const req = bidsConfig();

    await buildRTD({ waitForTargeting: true }).handleRtd(req);

    expect(req.ortb2Fragments.global.site).toBeUndefined();
    expect(read).toBe(false);
  });

  it("merges a contextual response that lands while waiting for targeting", async () => {
    let cached: ContextualSegmentsResponse | null = null;
    o.optable = { instance: { ctxSegmentsFromCache: () => cached } };
    const req = bidsConfig();
    const pending = buildRTD({ waitForTargeting: true, enableContextual: () => true }).handleRtd(req);

    cached = CONTEXTUAL;
    seedCache(EIDS);
    window.dispatchEvent(new CustomEvent(targetingEventName));
    await pending;

    expect(req.ortb2Fragments.global.site).toEqual(CONTEXTUAL_SITE);
  });

  it("re-evaluates enableContextual per auction", async () => {
    o.optable = { instance: fakeInstance(CONTEXTUAL) };
    let enabled = false;
    const rtd = buildRTD({ enableContextual: () => enabled });

    const first = bidsConfig();
    await rtd.handleRtd(first);
    expect(first.ortb2Fragments.global.site).toBeUndefined();

    enabled = true;
    const second = bidsConfig();
    await rtd.handleRtd(second);
    expect(second.ortb2Fragments.global.site).toEqual(CONTEXTUAL_SITE);
  });

  it("merges the instance's cached contextual response into the global site", async () => {
    o.optable = { instance: fakeInstance(CONTEXTUAL) };
    const req = bidsConfig();

    await buildRTD({ enableContextual: () => true }).handleRtd(req);

    expect(req.ortb2Fragments.global.site).toEqual(CONTEXTUAL_SITE);
  });

  it("skips a contextual response cached for another page", async () => {
    o.optable = { instance: fakeInstance(CONTEXTUAL, "https://example.com/previous-route") };
    const req = bidsConfig();

    await buildRTD({ enableContextual: () => true }).handleRtd(req);

    expect(req.ortb2Fragments.global.site).toBeUndefined();
  });

  it("reads the instance named by the instance option", async () => {
    o.optable = { instance: fakeInstance(null), other: fakeInstance(CONTEXTUAL) };
    const req = bidsConfig();

    await buildRTD({ enableContextual: () => true, instance: "other" }).handleRtd(req);

    expect(req.ortb2Fragments.global.site).toEqual(CONTEXTUAL_SITE);
  });

  it("leaves site untouched without an SDK instance or a contextual response", async () => {
    const req = bidsConfig();
    await buildRTD({ enableContextual: () => true }).handleRtd(req);
    expect(req.ortb2Fragments.global.site).toBeUndefined();

    o.optable = { instance: fakeInstance(null) };
    await buildRTD({ enableContextual: () => true }).handleRtd(req);
    expect(req.ortb2Fragments.global.site).toBeUndefined();
  });

  it("merges only the keywords when the response has no IAB categories", async () => {
    const keywordsOnly = {
      classifications: {
        categories: [{ id: "x", name: "Other", score: 0.9, taxonomy: "custom" }],
        keywords: [{ keyword: "earnings", prominence: 1 }],
      },
    } as ContextualSegmentsResponse;
    o.optable = { instance: fakeInstance(keywordsOnly) };
    const req = bidsConfig();

    await buildRTD({ enableContextual: () => true }).handleRtd(req);

    expect(req.ortb2Fragments.global.site).toEqual({ content: { keywords: "earnings" } });
  });

  it("leaves site untouched when the response has neither IAB categories nor keywords", async () => {
    o.optable = {
      instance: fakeInstance({
        classifications: { categories: [], keywords: [] },
      } as unknown as ContextualSegmentsResponse),
    };
    const req = bidsConfig();
    req.ortb2Fragments.global.site = { content: { data: [{ name: "publisher.com", segment: [{ id: "a" }] }] } };

    await buildRTD({ enableContextual: () => true }).handleRtd(req);

    expect(req.ortb2Fragments.global.site).toEqual({
      content: { data: [{ name: "publisher.com", segment: [{ id: "a" }] }] },
    });
  });

  it("drops our stale site data when the response has no IAB categories", async () => {
    o.optable = {
      instance: fakeInstance({
        classifications: { categories: [], keywords: [] },
      } as unknown as ContextualSegmentsResponse),
    };
    const req = bidsConfig();
    req.ortb2Fragments.global.site = {
      content: {
        data: [
          { name: "publisher.com", segment: [{ id: "a" }] },
          { name: "optable.co", ext: { segtax: 9 }, segment: [{ id: "stale" }] },
        ],
      },
    };

    await buildRTD({ enableContextual: () => true }).handleRtd(req);

    expect(req.ortb2Fragments.global.site?.content?.data).toEqual([{ name: "publisher.com", segment: [{ id: "a" }] }]);
  });

  it("serves contextual data to the control group, but no EIDs", async () => {
    seedCache(EIDS);
    o.optable = { instance: fakeInstance(CONTEXTUAL) };
    const req = bidsConfig();

    await buildRTD({ enableContextual: () => true, isControlGroup: () => true }).handleRtd(req);

    expect(req.ortb2Fragments.global.site).toEqual(CONTEXTUAL_SITE);
    expect(globalEids(req)).toHaveLength(0);
  });

  it("keeps the publisher's site data and replaces only ours", async () => {
    o.optable = { instance: fakeInstance(CONTEXTUAL) };
    const req = bidsConfig();
    req.ortb2Fragments.global.site = {
      content: {
        data: [
          { name: "publisher.com", segment: [{ id: "a" }] },
          { name: "optable.co", ext: { segtax: 9 }, segment: [{ id: "stale" }] },
        ],
        keywords: "finance, earnings",
      },
      ext: { data: { section: ["markets"], ctx_kw: ["stale"] } },
    };

    await buildRTD({ enableContextual: () => true }).handleRtd(req);

    expect(req.ortb2Fragments.global.site).toEqual({
      content: {
        data: [
          { name: "publisher.com", segment: [{ id: "a" }] },
          { name: "optable.co", ext: { segtax: 9 }, segment: [{ id: "53" }] },
        ],
        keywords: "finance, earnings",
      },
      ext: { data: { section: ["markets"], ctx_kw: ["stale"] } },
    });
  });

  it("appends keywords to both keywords and the publisher's kwarray when it is set", async () => {
    o.optable = { instance: fakeInstance(CONTEXTUAL) };
    const req = bidsConfig();
    req.ortb2Fragments.global.site = { content: { kwarray: ["finance"] } };

    await buildRTD({ enableContextual: () => true }).handleRtd(req);

    expect(req.ortb2Fragments.global.site?.content?.keywords).toEqual("earnings");
    expect(req.ortb2Fragments.global.site?.content?.kwarray).toEqual(["finance", "earnings"]);
  });

  it("ignores the publisher's keywords when they are not a string", async () => {
    o.optable = { instance: fakeInstance(CONTEXTUAL) };
    const req = bidsConfig();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    req.ortb2Fragments.global.site = { content: { keywords: ["sports"] as any } };

    await buildRTD({ enableContextual: () => true }).handleRtd(req);

    expect(req.ortb2Fragments.global.site?.content?.keywords).toEqual("earnings");
  });

  it("leaves the publisher's keywords untouched and appends only ours they lack, ignoring case and spacing", async () => {
    o.optable = {
      instance: fakeInstance({
        classifications: {
          keywords: [
            { keyword: "finals", prominence: 1 },
            { keyword: "earnings", prominence: 2 },
          ],
        },
      } as ContextualSegmentsResponse),
    };
    const req = bidsConfig();
    req.ortb2Fragments.global.site = {
      content: { keywords: "NBA, nba, Finals ", kwarray: ["NBA", "nba", " Finals ", 7 as unknown as string] },
    };

    await buildRTD({ enableContextual: () => true }).handleRtd(req);

    expect(req.ortb2Fragments.global.site?.content?.keywords).toBe("NBA, nba, Finals ,earnings");
    expect(req.ortb2Fragments.global.site?.content?.kwarray).toEqual(["NBA", "nba", " Finals ", 7, "earnings"]);
  });

  it("warns when the SDK instance does not exist yet", async () => {
    const rtd = buildRTD({ enableContextual: () => true });
    const log = jest.fn();
    rtd.log = log;

    await rtd.handleRtd(bidsConfig());

    expect(log).toHaveBeenCalledWith("warn", expect.stringContaining("window.optable.instance"));
  });

  it("warns when the SDK instance predates ctxSegmentsFromCache", async () => {
    o.optable = { instance: {} };
    const rtd = buildRTD({ enableContextual: () => true });
    const log = jest.fn();
    rtd.log = log;

    await rtd.handleRtd(bidsConfig());

    expect(log).toHaveBeenCalledWith("warn", expect.stringContaining("ctxSegmentsFromCache"));
  });

  it("counts merged keywords in the merge log", async () => {
    o.optable = {
      instance: fakeInstance({
        classifications: { keywords: [{ keyword: "earnings", prominence: 1 }] },
      } as ContextualSegmentsResponse),
    };
    const rtd = buildRTD({ enableContextual: () => true });
    const log = jest.fn();
    rtd.log = log;

    await rtd.handleRtd(bidsConfig());

    expect(log).toHaveBeenCalledWith("info", "Merged contextual data: 0 segment set(s), 1 keyword(s)");
  });

  it("counts only the keywords actually added in the merge log", async () => {
    o.optable = { instance: fakeInstance(CONTEXTUAL) };
    const req = bidsConfig();
    req.ortb2Fragments.global.site = { content: { keywords: "earnings" } };
    const rtd = buildRTD({ enableContextual: () => true });
    const log = jest.fn();
    rtd.log = log;

    await rtd.handleRtd(req);

    expect(log).toHaveBeenCalledWith("info", "Merged contextual data: 1 segment set(s), 0 keyword(s)");
  });

  it("does not leave an empty keyword when the publisher's keywords end with a comma", async () => {
    o.optable = { instance: fakeInstance(CONTEXTUAL) };
    const req = bidsConfig();
    req.ortb2Fragments.global.site = { content: { keywords: "sports, " } };

    await buildRTD({ enableContextual: () => true }).handleRtd(req);

    expect(req.ortb2Fragments.global.site?.content?.keywords).toBe("sports,earnings");
  });

  it("does not leave an empty keyword when the publisher's keywords are only commas", async () => {
    o.optable = { instance: fakeInstance(CONTEXTUAL) };
    const req = bidsConfig();
    req.ortb2Fragments.global.site = { content: { keywords: " , " } };

    await buildRTD({ enableContextual: () => true }).handleRtd(req);

    expect(req.ortb2Fragments.global.site?.content?.keywords).toBe("earnings");
  });

  it("does not append keywords the publisher already has in another case", async () => {
    o.optable = { instance: fakeInstance(CONTEXTUAL) };
    const req = bidsConfig();
    req.ortb2Fragments.global.site = { content: { keywords: "Earnings,finance", kwarray: ["EARNINGS"] } };

    await buildRTD({ enableContextual: () => true }).handleRtd(req);

    expect(req.ortb2Fragments.global.site?.content?.keywords).toBe("Earnings,finance");
    expect(req.ortb2Fragments.global.site?.content?.kwarray).toEqual(["EARNINGS"]);
  });

  it("appends keywords the publisher does not already have", async () => {
    o.optable = { instance: fakeInstance(CONTEXTUAL) };
    const req = bidsConfig();
    req.ortb2Fragments.global.site = { content: { keywords: "finance" } };

    await buildRTD({ enableContextual: () => true }).handleRtd(req);

    expect(req.ortb2Fragments.global.site?.content?.keywords).toBe("finance,earnings");
  });

  it("serves EIDs when enableContextual throws", async () => {
    seedCache(EIDS);
    const req = bidsConfig();

    await buildRTD({
      enableContextual: () => {
        throw new TypeError("assignment not ready");
      },
    }).handleRtd(req);

    expect(globalEids(req)).toHaveLength(1);
  });

  it("serves EIDs when merging contextual data throws", async () => {
    seedCache(EIDS);
    o.optable = { instance: fakeInstance(CONTEXTUAL) };
    const req = bidsConfig();
    req.ortb2Fragments.global.site = { content: { data: {} as unknown as [] } };

    await buildRTD({ enableContextual: () => true }).handleRtd(req);

    expect(globalEids(req)).toHaveLength(1);
  });
});

describe("buildRTD - isControlGroup", () => {
  it("serves no EIDs while the gate returns true", async () => {
    seedCache(EIDS);
    const req = bidsConfig();

    const result = await buildRTD({ isControlGroup: () => true }).handleRtd(req);

    expect(result).toBeNull();
    expect(globalEids(req)).toHaveLength(0);
  });

  it("is re-evaluated per auction", async () => {
    seedCache(EIDS);
    let control = true;
    const rtd = buildRTD({ isControlGroup: () => control });

    const first = bidsConfig();
    await rtd.handleRtd(first);
    expect(globalEids(first)).toHaveLength(0);

    control = false;
    const second = bidsConfig();
    await rtd.handleRtd(second);
    expect(globalEids(second)).toHaveLength(1);
  });
});
