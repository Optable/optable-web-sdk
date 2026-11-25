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

describe("sessionDepth", () => {
  // sessionStorage stringifies on write, so the stored depth reads back as a
  // string while the fallback is a number. Consumers see one field.
  test("is a number whether or not the session has a stored depth", async () => {
    const { analytics, witness } = makeAnalytics();
    sessionStorage.removeItem("optableSessionDepthIndex");
    const unset = await run(analytics, witness, { bidderRequests: [bidderRequest("a", [])] });
    expect(unset.sessionDepth).toBe(1);

    sessionStorage.optableSessionDepthIndex = "4";
    const stored = await run(analytics, witness, { bidderRequests: [bidderRequest("a", [])] });
    expect(stored.sessionDepth).toBe(4);
  });
});

describe("page config", () => {
  test("sent on the first auction of the page only", async () => {
    const { analytics, witness } = makeAnalytics();
    analytics.prebidInstance = {
      version: "v10.27.0",
      installedModules: ["rtdModule", "optableRtdProvider"],
      getConfig: (k) =>
        ({
          realTimeData: { auctionDelay: 150, dataProviders: [{ name: "optable", waitForIt: true }] },
          userSync: { auctionDelay: 250 },
        })[k],
    };
    const first = await run(analytics, witness, { bidderRequests: [bidderRequest("a", [])] });
    expect(first.page).toEqual({ optableRTDInstalled: 1, optableRTDConfigured: 1, rtdDelay: 150, udDelay: 250 });
    const second = await run(analytics, witness, { bidderRequests: [bidderRequest("a", [])] });
    expect(second.page).toBeUndefined();
  });

  test("reports the RTD module installed but not configured", async () => {
    const { analytics, witness } = makeAnalytics();
    analytics.prebidInstance = {
      installedModules: ["optableRtdProvider"],
      getConfig: () => undefined,
    };
    const p = await run(analytics, witness, { bidderRequests: [bidderRequest("a", [])] });
    expect(p.page).toMatchObject({ optableRTDInstalled: 1, optableRTDConfigured: 0 });
  });

  test("reports the RTD module not installed when installedModules is missing", async () => {
    const { analytics, witness } = makeAnalytics();
    analytics.prebidInstance = {
      getConfig: (k) => (k === "realTimeData" ? { dataProviders: [{ name: "optable" }] } : undefined),
    };
    const p = await run(analytics, witness, { bidderRequests: [bidderRequest("a", [])] });
    expect(p.page).toMatchObject({ optableRTDInstalled: 0, optableRTDConfigured: 1 });
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

  test("seat bids attach to the s2s request when the seat differs from the requested bidder", async () => {
    const { analytics, witness } = makeAnalytics();
    const pbs = bidderRequest("prebidServer", [], { bids: [{ bidId: "bid-pbs", adUnitCode: "slot-1", src: "s2s" }] });
    const p = await run(analytics, witness, {
      bidderRequests: [bidderRequest("ix", []), pbs],
      bidsReceived: [
        { requestId: null, bidderCode: "amx_ay", adapterCode: "amx", adUnitCode: "slot-1", cpm: 2.53, source: "s2s" },
        { requestId: null, bidderCode: "ix_ay", adapterCode: "ix", adUnitCode: "slot-1", cpm: 3.84, source: "s2s" },
      ],
    });
    const bids = p.bidderRequests.find((r) => r.bidderCode === "prebidServer").bids;
    expect(bids.map((b) => [b.seat, b.cpm, b.src])).toEqual([
      ["amx_ay", 2.53, "s2s"],
      ["ix_ay", 3.84, "s2s"],
    ]);
    expect(bids[1].bidId).not.toBe(bids[0].bidId);
    expect(p.totalBids).toBe(2);
    expect(p.unmatchedBids).toBeUndefined();
  });

  test("a seat bid does not take the slot of a bid that arrives later with its own requestId", async () => {
    const { analytics, witness } = makeAnalytics();
    const pbs = bidderRequest("prebidServer", [], { bids: [{ bidId: "bid-pbs", adUnitCode: "slot-1", src: "s2s" }] });
    const p = await run(analytics, witness, {
      bidderRequests: [pbs],
      bidsReceived: [
        { requestId: null, bidderCode: "amx_ay", adUnitCode: "slot-1", cpm: 2.53, source: "s2s" },
        { requestId: "bid-pbs", bidderCode: "prebidServer", adUnitCode: "slot-1", cpm: 3.84, source: "s2s" },
      ],
    });
    const bids = p.bidderRequests[0].bids;
    expect(bids.find((b) => b.bidId === "bid-pbs").cpm).toBe(3.84);
    expect(bids.find((b) => b.seat === "amx_ay").cpm).toBe(2.53);
    expect(p.totalBids).toBe(2);
  });

  test("a same-bidder server bid does not take the slot of a client bid that arrives later with its requestId", async () => {
    const { analytics, witness } = makeAnalytics();
    const ixS2s = bidderRequest("ix", [], {
      bidderRequestId: "br-ix-s2s",
      bids: [{ bidId: "bid-ix-s2s", adUnitCode: "slot-1", src: "s2s" }],
    });
    const p = await run(analytics, witness, {
      bidderRequests: [bidderRequest("ix", []), ixS2s],
      bidsReceived: [
        { requestId: "s2s-xyz", bidderCode: "ix", adUnitCode: "slot-1", cpm: 1.5, source: "s2s" },
        { requestId: "bid-ix", bidderCode: "ix", adUnitCode: "slot-1", cpm: 2, source: "client" },
      ],
    });
    const [client, server] = p.bidderRequests;
    expect(client.bids[0].cpm).toBe(2);
    expect(server.bids[0].cpm).toBe(1.5);
    expect(p.totalBids).toBe(2);
    expect(p.unmatchedBids).toBeUndefined();
  });

  test("with two server bidders on the ad unit, unknown seats go to the first s2s request", async () => {
    const { analytics, witness } = makeAnalytics();
    const pbsA = bidderRequest("pbsA", [], { bids: [{ bidId: "bid-pbsA", adUnitCode: "slot-1", src: "s2s" }] });
    const pbsB = bidderRequest("pbsB", [], { bids: [{ bidId: "bid-pbsB", adUnitCode: "slot-1", src: "s2s" }] });
    const p = await run(analytics, witness, {
      bidderRequests: [pbsA, pbsB],
      bidsReceived: [
        { requestId: null, bidderCode: "amx_ay", adUnitCode: "slot-1", cpm: 2.53, source: "s2s" },
        { requestId: null, bidderCode: "ix_ay", adUnitCode: "slot-1", cpm: 3.84, source: "s2s" },
      ],
    });
    const [a, b] = p.bidderRequests;
    expect(a.bids.map((x) => [x.seat, x.cpm])).toEqual([
      ["amx_ay", 2.53],
      ["ix_ay", 3.84],
    ]);
    expect(b.bids[0].cpm).toBeUndefined();
    expect(p.totalBids).toBe(2);
  });

  test("seat bids stay unmatched when no s2s request covers the ad unit", async () => {
    const { analytics, witness } = makeAnalytics();
    const pbs = bidderRequest("prebidServer", [], { bids: [{ bidId: "bid-pbs", adUnitCode: "slot-1", src: "s2s" }] });
    const p = await run(analytics, witness, {
      bidderRequests: [pbs],
      bidsReceived: [{ requestId: null, bidderCode: "amx_ay", adUnitCode: "slot-2", cpm: 2, source: "s2s" }],
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

describe("buyer fields on received bids", () => {
  test("adds advertiser domains, deal and buyer ids when the bid carries them", async () => {
    const { analytics, witness } = makeAnalytics();
    const p = await run(analytics, witness, {
      bidderRequests: [bidderRequest("a", [])],
      bidsReceived: [
        {
          requestId: "bid-a",
          bidderCode: "a",
          adUnitCode: "slot-1",
          cpm: 2,
          dealId: "DEAL-1",
          meta: { advertiserDomains: ["Brand.example"], networkId: 1234, buyerId: "5678" },
        },
      ],
    });
    expect(p.bidderRequests[0].bids[0]).toMatchObject({
      cpm: 2,
      adomain: ["brand.example"],
      dealId: "DEAL-1",
      networkId: "1234",
      buyerId: "5678",
    });
  });

  test("adds nothing when the bid has no buyer fields", async () => {
    const { analytics, witness } = makeAnalytics();
    const p = await run(analytics, witness, {
      bidderRequests: [bidderRequest("a", [])],
      bidsReceived: [{ requestId: "bid-a", bidderCode: "a", adUnitCode: "slot-1", cpm: 2 }],
    });
    const bid = p.bidderRequests[0].bids[0];
    for (const k of ["adomain", "dealId", "networkId", "networkName", "buyerId", "advertiserId"]) {
      expect(bid).not.toHaveProperty(k);
    }
  });
});
