import { targetingEventName } from "../events/cache-refresh";
import { buildRTD } from "./rtd";
import type { ReqBidsConfigObj } from "./rtd";

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

describe("buildRTD - eidRules", () => {
  const OURS = [
    { source: "uidapi.com", uids: [{ id: "uid2" }] },
    { source: "criteo-hemapi.com", uids: [{ id: "hem" }] },
    { source: "triplelift.com", uids: [{ id: "tl" }] },
  ];

  // An auction with these bidders, LiveIntent's EID already in global ORTB2
  // when `liveintent` is set, and no bidder fragments (Prebid only creates
  // them for bidders with bidder config).
  function auction(bidders: string[], { liveintent = false } = {}): ReqBidsConfigObj {
    const global = liveintent ? { user: { ext: { eids: [{ source: "liveintent.com", uids: [{ id: "li" }] }] } } } : {};
    return {
      adUnits: [{ bids: bidders.map((bidder) => ({ bidder })) }],
      ortb2Fragments: { global, bidder: {} },
    };
  }

  function sourcesIn(ortb2?: { user?: { ext?: { eids?: { source: string }[] } } }) {
    return (ortb2?.user?.ext?.eids ?? []).map((eid) => eid.source).filter((s) => s !== "liveintent.com");
  }

  beforeEach(() => seedCache(OURS));

  it("is a no-op without rules", async () => {
    const req = auction(["criteo", "kargo"]);

    await buildRTD({ eidSources: {} }).handleRtd(req);

    expect(sourcesIn(req.ortb2Fragments.global)).toEqual(["uidapi.com", "criteo-hemapi.com", "triplelift.com"]);
    expect(req.ortb2Fragments.bidder).toEqual({});
  });

  it("holds named bidders out when another provider resolved the user", async () => {
    const rtd = buildRTD({
      eidSources: {},
      eidRules: [{ when: { sourcePresent: "liveintent" }, exclude: ["kargo"] }],
    });
    const req = auction(["criteo", "kargo", "ttd"], { liveintent: true });

    await rtd.handleRtd(req);

    expect(sourcesIn(req.ortb2Fragments.global)).toEqual([]);
    expect(req.ortb2Fragments.bidder.kargo).toBeUndefined();
    expect(sourcesIn(req.ortb2Fragments.bidder.criteo)).toEqual(["uidapi.com", "criteo-hemapi.com", "triplelift.com"]);
    expect(sourcesIn(req.ortb2Fragments.bidder.ttd)).toEqual(["uidapi.com", "criteo-hemapi.com", "triplelift.com"]);
  });

  it("does not fire when the condition is not met", async () => {
    const rtd = buildRTD({
      eidSources: {},
      eidRules: [{ when: { sourcePresent: "liveintent" }, exclude: ["kargo"] }],
    });
    const req = auction(["criteo", "kargo"]);

    await rtd.handleRtd(req);

    expect(sourcesIn(req.ortb2Fragments.global)).toHaveLength(3);
    expect(req.ortb2Fragments.bidder).toEqual({});
  });

  it("honors sourceAbsent", async () => {
    const rtd = buildRTD({
      eidSources: {},
      eidRules: [{ when: { sourceAbsent: "liveintent" }, exclude: ["kargo"] }],
    });
    const withLi = auction(["criteo", "kargo"], { liveintent: true });
    const withoutLi = auction(["criteo", "kargo"]);

    await rtd.handleRtd(withLi);
    await rtd.handleRtd(withoutLi);

    expect(sourcesIn(withLi.ortb2Fragments.global)).toHaveLength(3);
    expect(withoutLi.ortb2Fragments.bidder.kargo).toBeUndefined();
    expect(sourcesIn(withoutLi.ortb2Fragments.bidder.criteo)).toHaveLength(3);
  });

  it("ignores our own EIDs when evaluating conditions", async () => {
    const rtd = buildRTD({
      eidSources: {},
      eidRules: [{ when: { sourcePresent: "uidapi" }, exclude: ["kargo"] }],
    });
    const req = auction(["criteo", "kargo"]);
    req.ortb2Fragments.global = {
      user: { ext: { eids: [{ source: "uidapi.com", uids: [{ id: "ppid" }], inserter: "optable.co" } as any] } },
    };

    await rtd.handleRtd(req);

    expect(req.ortb2Fragments.bidder).toEqual({});
  });

  it("excludes -s2s and _s2s aliases with the bidder", async () => {
    const rtd = buildRTD({ eidSources: {}, eidRules: [{ exclude: ["ix"] }] });
    const req = auction(["ix", "ix-s2s", "ix_s2s", "criteo"]);

    await rtd.handleRtd(req);

    expect(Object.keys(req.ortb2Fragments.bidder)).toEqual(["criteo"]);
  });

  it("counts s2sConfig bidders as auction bidders", async () => {
    w.pbjs = { getConfig: (key?: unknown) => (key === "s2sConfig" ? [{ bidders: ["rubicon-s2s"] }] : {}) };
    const rtd = buildRTD({ eidSources: {}, eidRules: [{ exclude: ["kargo"] }] });
    const req = auction(["kargo", "criteo"]);

    await rtd.handleRtd(req);

    expect(Object.keys(req.ortb2Fragments.bidder).sort()).toEqual(["criteo", "rubicon-s2s"]);
  });

  it("scopes a partner's own ID to that partner, leaving other sources global", async () => {
    const rtd = buildRTD({
      eidSources: {},
      eidRules: [{ sources: ["triplelift.com"], routes: ["triplelift"] }],
    });
    const req = auction(["triplelift", "criteo"]);

    await rtd.handleRtd(req);

    expect(sourcesIn(req.ortb2Fragments.global)).toEqual(["uidapi.com", "criteo-hemapi.com"]);
    expect(sourcesIn(req.ortb2Fragments.bidder.triplelift)).toEqual(["triplelift.com"]);
    expect(req.ortb2Fragments.bidder.criteo).toBeUndefined();
  });

  it("adds a bidder to a source's configured routes with include", async () => {
    const rtd = buildRTD({
      eidSources: { "uidapi.com": { routes: ["criteo"] } },
      eidRules: [{ sources: "uidapi", include: ["ttd"] }],
    });
    const req = auction(["criteo", "ttd", "kargo"]);

    await rtd.handleRtd(req);

    expect(sourcesIn(req.ortb2Fragments.bidder.criteo)).toEqual(["uidapi.com"]);
    expect(sourcesIn(req.ortb2Fragments.bidder.ttd)).toEqual(["uidapi.com"]);
    expect(req.ortb2Fragments.bidder.kargo).toBeUndefined();
  });

  it("applies rules in order", async () => {
    const rtd = buildRTD({
      eidSources: {},
      eidRules: [{ sources: "triplelift", routes: ["triplelift", "kargo"] }, { exclude: ["kargo"] }],
    });
    const req = auction(["triplelift", "kargo", "criteo"]);

    await rtd.handleRtd(req);

    expect(sourcesIn(req.ortb2Fragments.bidder.triplelift)).toEqual([
      "uidapi.com",
      "criteo-hemapi.com",
      "triplelift.com",
    ]);
    expect(sourcesIn(req.ortb2Fragments.bidder.criteo)).toEqual(["uidapi.com", "criteo-hemapi.com"]);
    expect(req.ortb2Fragments.bidder.kargo).toBeUndefined();
  });

  it("drops bidders absent from the auction instead of falling back to global", async () => {
    const rtd = buildRTD({ eidSources: {}, eidRules: [{ routes: ["notbidding"] }] });
    const req = auction(["criteo"]);

    await rtd.handleRtd(req);

    expect(sourcesIn(req.ortb2Fragments.global)).toEqual([]);
    expect(req.ortb2Fragments.bidder).toEqual({});
  });

  it("stays global when the rules leave every bidder in", async () => {
    const rtd = buildRTD({ eidSources: {}, eidRules: [{ exclude: ["notbidding"] }] });
    const req = auction(["criteo", "kargo"]);

    await rtd.handleRtd(req);

    expect(sourcesIn(req.ortb2Fragments.global)).toHaveLength(3);
    expect(req.ortb2Fragments.bidder).toEqual({});
  });

  it("leaves routing unchanged when no auction bidders are known", async () => {
    const rtd = buildRTD({ eidSources: {}, eidRules: [{ exclude: ["kargo"] }] });
    const req = bidsConfig();

    await rtd.handleRtd(req);

    expect(globalEids(req)).toHaveLength(3);
  });

  it("merges into an existing bidder fragment", async () => {
    const rtd = buildRTD({ eidSources: {}, eidRules: [{ exclude: ["kargo"] }] });
    const req = auction(["criteo", "kargo"]);
    req.ortb2Fragments.bidder.criteo = { user: { ext: { eids: [{ source: "criteo.com", uids: [{ id: "c" }] }] } } };

    await rtd.handleRtd(req);

    expect(sourcesIn(req.ortb2Fragments.bidder.criteo)).toEqual([
      "criteo.com",
      "uidapi.com",
      "criteo-hemapi.com",
      "triplelift.com",
    ]);
  });

  it("reads rules from the config object on each auction", async () => {
    const rtd = buildRTD({ eidSources: {} });
    rtd.eidRules = [{ exclude: ["kargo"] }];
    const req = auction(["criteo", "kargo"]);

    await rtd.handleRtd(req);

    expect(req.ortb2Fragments.bidder.kargo).toBeUndefined();
    expect(sourcesIn(req.ortb2Fragments.bidder.criteo)).toHaveLength(3);
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
