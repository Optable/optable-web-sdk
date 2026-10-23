import OptablePrebidAnalytics from "./analytics";

global.SDK_WRAPPER_VERSION = "1.0.0-test";

function bidderRequest(bidderCode, sources) {
  return {
    bidderCode,
    bidderRequestId: `br-${bidderCode}`,
    ortb2: {
      user: { ext: { eids: sources.map((source) => ({ source, inserter: "optable.co", uids: [{ id: "x" }] })) } },
    },
    bids: [{ bidId: `bid-${bidderCode}`, adUnitCode: "slot-1" }],
  };
}

async function run(sources, missed) {
  const witness = jest.fn().mockResolvedValue(undefined);
  const analytics = new OptablePrebidAnalytics({ witness }, { analytics: true, tenant: "t" });
  await analytics.trackAuctionEnd({ auctionId: "a-1", bidderRequests: [bidderRequest("a", sources)] }, missed);
  return JSON.parse(witness.mock.calls[0][1].auction);
}

beforeEach(() => {
  window.optable = {};
});

describe("missed", () => {
  test("false when the hook attached before the auction", async () => {
    expect((await run([], false)).missed).toBe(false);
  });

  test("false when the hook attached late but Optable sources are present", async () => {
    const p = await run(["uidapi.com"], true);
    expect(p.optableSources).toEqual(["uidapi.com"]);
    expect(p.missed).toBe(false);
  });

  test("true when the hook attached late and no Optable sources are present", async () => {
    expect((await run([], true)).missed).toBe(true);
  });
});
