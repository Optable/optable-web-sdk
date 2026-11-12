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

function withAuctionDelay(ms: number): PrebidStub {
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

  // The bug this option exists for: the auction runs on another instance, the
  // delay lookup misses, and the wait never happens.
  it("does not wait when only another instance declares the delay", async () => {
    delete w.pbjs;
    w.asc = withAuctionDelay(500);
    const req = bidsConfig();

    await buildRTD({ waitForTargeting: true }).handleRtd(req);

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

  it("warns when the wait is asked for but no delay bounds it", async () => {
    delete w.pbjs;
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    const req = bidsConfig();

    await buildRTD({ waitForTargeting: true, enableLogging: true }).handleRtd(req);

    expect(warn.mock.calls.flat().join(" ")).toContain("no realTimeData.auctionDelay");
    warn.mockRestore();
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
