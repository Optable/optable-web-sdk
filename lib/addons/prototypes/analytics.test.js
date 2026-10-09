import OptablePrebidAnalytics from "./analytics";

global.SDK_WRAPPER_VERSION = "1.0.0-test";

function makeAnalytics(config = {}) {
  const witness = jest.fn().mockResolvedValue(undefined);
  const analytics = new OptablePrebidAnalytics({ witness }, { analytics: true, tenant: "t", ...config });
  return { analytics, witness };
}

function bidderRequest(bidderCode, sources, extra = {}) {
  return {
    bidderCode,
    bidderRequestId: `br-${bidderCode}`,
    ortb2: {
      user: { ext: { eids: sources.map((source) => ({ source, inserter: "optable.co", uids: [{ id: "x" }] })) } },
    },
    bids: [{ bidId: `bid-${bidderCode}`, adUnitCode: "slot-1" }],
    ...extra,
  };
}

async function run(analytics, witness, event) {
  await analytics.trackAuctionEnd({ auctionId: `a-${Math.random()}`, ...event }, false);
  const calls = witness.mock.calls;
  return JSON.parse(calls[calls.length - 1][1].auction);
}

beforeEach(() => {
  window.optable = {};
  localStorage.clear();
  delete navigator.globalPrivacyControl;
});

describe("per-bidder EID delivery (om)", () => {
  test("omitted when every bidder received every source", async () => {
    const { analytics, witness } = makeAnalytics();
    const p = await run(analytics, witness, {
      bidderRequests: [
        bidderRequest("a", ["uidapi.com", "criteo.com"]),
        bidderRequest("b", ["uidapi.com", "criteo.com"]),
      ],
    });
    expect(p.optableSources).toEqual(["uidapi.com", "criteo.com"]);
    p.bidderRequests.forEach((br) => expect(br.om).toBeUndefined());
  });

  test("bitmask over the auction-level sources when a bidder missed some", async () => {
    const { analytics, witness } = makeAnalytics();
    const p = await run(analytics, witness, {
      bidderRequests: [
        bidderRequest("a", ["uidapi.com", "criteo.com"]),
        bidderRequest("b", ["criteo.com"]),
        bidderRequest("c", []),
      ],
    });
    const byCode = Object.fromEntries(p.bidderRequests.map((br) => [br.bidderCode, br]));
    expect(p.optableSources).toEqual(["uidapi.com", "criteo.com"]);
    expect(byCode.a.om).toBeUndefined();
    expect(byCode.b.om).toBe(2);
    expect(byCode.c.om).toBe(0);
  });
});

describe("slotSeq and t0", () => {
  test("counts earlier auctions of the same ad unit on the page", async () => {
    const { analytics, witness } = makeAnalytics();
    const ev = () => ({ bidderRequests: [bidderRequest("a", [])] });
    expect((await run(analytics, witness, ev())).slotSeq).toBe(0);
    expect((await run(analytics, witness, ev())).slotSeq).toBe(1);
    expect((await run(analytics, witness, ev())).slotSeq).toBe(2);
  });

  test("t0 is the auction start relative to page start", async () => {
    const { analytics, witness } = makeAnalytics();
    const p = await run(analytics, witness, {
      timestamp: performance.timeOrigin + 1234,
      bidderRequests: [bidderRequest("a", [])],
    });
    expect(p.t0).toBe(1234);
  });
});

describe("consent flags", () => {
  test("encodes GDPR, GPC, US privacy opt-out, GPP and blocked storage", async () => {
    const { analytics, witness } = makeAnalytics();
    Object.defineProperty(navigator, "globalPrivacyControl", { value: true, configurable: true });
    analytics.noteTcfEnforcement({ storageBlocked: ["someModule"] });
    const p = await run(analytics, witness, {
      bidderRequests: [
        bidderRequest("a", [], {
          gdprConsent: { gdprApplies: true },
          uspConsent: "1YYN",
          gppConsent: { gppString: "DBABM~" },
        }),
      ],
    });
    expect(p.consent).toBe(1 | 2 | 4 | 8 | 16);
  });

  test("zero when nothing applies", async () => {
    const { analytics, witness } = makeAnalytics();
    const p = await run(analytics, witness, { bidderRequests: [bidderRequest("a", [], { uspConsent: "1YNN" })] });
    expect(p.consent).toBe(0);
  });
});

describe("cache state", () => {
  test("-1 when there is no targeting cache", async () => {
    const { analytics, witness } = makeAnalytics();
    const p = await run(analytics, witness, { bidderRequests: [bidderRequest("a", [])] });
    expect(p.cacheAge).toBe(-1);
    expect(p.idsMs).toBeUndefined();
  });

  test("age in seconds from the :ts sibling, idsMs when written this page", async () => {
    const { analytics, witness } = makeAnalytics();
    localStorage.setItem("OPTABLE_RESOLVED", "{}");
    localStorage.setItem("OPTABLE_RESOLVED:ts", String(Date.now() - 5000));
    const p = await run(analytics, witness, { bidderRequests: [bidderRequest("a", [])] });
    expect(p.cacheAge).toBeGreaterThanOrEqual(4);
    expect(p.cacheAge).toBeLessThanOrEqual(6);
  });

  test("absent when the cache predates the timestamp", async () => {
    const { analytics, witness } = makeAnalytics();
    localStorage.setItem("OPTABLE_RESOLVED", "{}");
    const p = await run(analytics, witness, { bidderRequests: [bidderRequest("a", [])] });
    expect(p.cacheAge).toBeUndefined();
  });

  test("uses the configured cache key", async () => {
    const { analytics, witness } = makeAnalytics({ cacheKey: "CUSTOM" });
    localStorage.setItem("CUSTOM", "{}");
    localStorage.setItem("CUSTOM:ts", String(Date.now()));
    const p = await run(analytics, witness, { bidderRequests: [bidderRequest("a", [])] });
    expect(p.cacheAge).toBe(0);
  });
});

describe("page config", () => {
  test("sent on the first auction of the page only", async () => {
    const { analytics, witness } = makeAnalytics();
    analytics.prebidInstance = {
      version: "v10.27.0",
      getConfig: (k) =>
        ({
          realTimeData: { auctionDelay: 150, dataProviders: [{ name: "optable", waitForIt: true }] },
          userSync: { auctionDelay: 250 },
        })[k],
    };
    const first = await run(analytics, witness, { bidderRequests: [bidderRequest("a", [])] });
    expect(first.page).toEqual({ rtdOptable: 1, rtdDelay: 150, udDelay: 250 });
    const second = await run(analytics, witness, { bidderRequests: [bidderRequest("a", [])] });
    expect(second.page).toBeUndefined();
  });
});

describe("Prebid Server responses", () => {
  test("matched by bidder and ad unit when the requestId matches no client bid", async () => {
    const { analytics, witness } = makeAnalytics();
    const p = await run(analytics, witness, {
      bidderRequests: [bidderRequest("a", [])],
      bidsReceived: [{ requestId: "s2s-xyz", bidderCode: "a", adUnitCode: "slot-1", cpm: 1.5, source: "s2s" }],
    });
    const bid = p.bidderRequests[0].bids[0];
    expect(bid.cpm).toBe(1.5);
    expect(bid.src).toBe("s2s");
    expect(p.totalBids).toBe(1);
    expect(p.unmatchedBids).toBeUndefined();
  });

  test("counted as unmatched when no bidder or ad unit fits", async () => {
    const { analytics, witness } = makeAnalytics();
    const p = await run(analytics, witness, {
      bidderRequests: [bidderRequest("a", [])],
      bidsReceived: [{ requestId: "s2s-xyz", bidderCode: "zzz", adUnitCode: "slot-9", cpm: 1.5, source: "s2s" }],
    });
    expect(p.unmatchedBids).toBe(1);
    expect(p.totalBids).toBe(0);
  });

  test("client bids keep the existing shape (no src field)", async () => {
    const { analytics, witness } = makeAnalytics();
    const p = await run(analytics, witness, {
      bidderRequests: [bidderRequest("a", [])],
      bidsReceived: [{ requestId: "bid-a", bidderCode: "a", adUnitCode: "slot-1", cpm: 2, source: "client" }],
    });
    expect(p.bidderRequests[0].bids[0].src).toBeUndefined();
    expect(p.bidderRequests[0].bids[0].cpm).toBe(2);
  });
});
