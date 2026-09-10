import { targetingEventName } from "../events/cache-refresh";
import { buildRTD } from "./rtd";
import type { ReqBidsConfigObj } from "./rtd";

const EIDS = [{ source: "uidapi.com", uids: [{ id: "uid2-token" }] }];

const w = window as unknown as { pbjs?: { getConfig: () => unknown } };

function bidsConfig(): ReqBidsConfigObj {
  return { ortb2Fragments: { global: {}, bidder: {} } };
}

function globalEids(req: ReqBidsConfigObj) {
  return req.ortb2Fragments.global.user?.ext?.eids ?? [];
}

function seedCache(eids: unknown[]) {
  localStorage.setItem("OPTABLE_RESOLVED", JSON.stringify({ ortb2: { user: { eids } } }));
}

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  w.pbjs = { getConfig: () => ({ realTimeData: { auctionDelay: 500 } }) };
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
});
