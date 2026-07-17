import { setupAB } from "./abTestAssignment.ts";
import { determineABTest } from "../edge/abTest";

const STORAGE_KEY = "OPTABLE_SPLIT_TEST";
const SESSION_OVERRIDE_KEY = "optableControlGroup";

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  jest.spyOn(Math, "random").mockReturnValue(0.5);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("setupAB - traffic assignment", () => {
  it("assigns the treatment variant when random bucket falls in its range", () => {
    jest.spyOn(Math, "random").mockReturnValue(0.0);
    const result = setupAB({ variants: [{ id: "all" }, { id: "none", trafficPercentage: 5 }] });
    expect(result.variant.id).toBe("all");
    expect(result.isControl).toBe(false);
  });

  it("assigns the control variant when random bucket falls in its range", () => {
    jest.spyOn(Math, "random").mockReturnValue(0.97);
    const result = setupAB({ variants: [{ id: "all" }, { id: "none", trafficPercentage: 5 }] });
    expect(result.variant.id).toBe("none");
    expect(result.isControl).toBe(true);
  });

  it("distributes remaining traffic equally among variants without trafficPercentage", () => {
    jest.spyOn(Math, "random").mockReturnValue(0.6);
    const result = setupAB({
      variants: [{ id: "a", trafficPercentage: 50 }, { id: "b" }, { id: "c" }],
    });
    expect(["b", "c"]).toContain(result.variant.id);
  });
});

describe("setupAB - localStorage stickiness", () => {
  it("persists the assignment to localStorage", () => {
    setupAB({ variants: [{ id: "all" }, { id: "none", trafficPercentage: 5 }] });
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(stored.id).toBe("all");
  });

  it("returns the cached assignment on subsequent calls", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ id: "none", trafficPercentage: 5 }));
    const result = setupAB({ variants: [{ id: "all" }, { id: "none", trafficPercentage: 5 }] });
    expect(result.variant.id).toBe("none");
  });

  it("ignores a cached value whose id is not in the variants list", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ id: "stale", trafficPercentage: 50 }));
    jest.spyOn(Math, "random").mockReturnValue(0.0);
    const result = setupAB({ variants: [{ id: "all" }, { id: "none", trafficPercentage: 5 }] });
    expect(result.variant.id).toBe("all");
  });

  it("respects a custom storageKey", () => {
    const key = "MY_AB_TEST";
    setupAB({ variants: [{ id: "all" }, { id: "none", trafficPercentage: 5 }], storageKey: key });
    expect(localStorage.getItem(key)).not.toBeNull();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});

describe("setupAB - sessionStorage override", () => {
  it("forces control when sessionStorage override is '1'", () => {
    sessionStorage.setItem(SESSION_OVERRIDE_KEY, "1");
    const result = setupAB({ variants: [{ id: "all" }, { id: "none", trafficPercentage: 5 }] });
    expect(result.variant.id).toBe("none");
    expect(result.isControl).toBe(true);
  });

  it("forces treatment when sessionStorage override is '0'", () => {
    sessionStorage.setItem(SESSION_OVERRIDE_KEY, "0");
    const result = setupAB({ variants: [{ id: "all" }, { id: "none", trafficPercentage: 5 }] });
    expect(result.variant.id).toBe("all");
    expect(result.isControl).toBe(false);
  });

  it("respects a custom sessionOverrideKey", () => {
    sessionStorage.setItem("myOverride", "1");
    const result = setupAB({
      variants: [{ id: "all" }, { id: "none", trafficPercentage: 5 }],
      sessionOverrideKey: "myOverride",
    });
    expect(result.variant.id).toBe("none");
  });
});

describe("setupAB - custom variant ids", () => {
  it("uses controlId and treatmentId to resolve isControl and overrides", () => {
    sessionStorage.setItem(SESSION_OVERRIDE_KEY, "0");
    const result = setupAB({
      variants: [{ id: "treatment" }, { id: "control", trafficPercentage: 10 }],
      controlId: "control",
      treatmentId: "treatment",
    });
    expect(result.variant.id).toBe("treatment");
    expect(result.isControl).toBe(false);
  });
});

describe("setupAB - getSplitTestAssignment", () => {
  it("returns the variant id", () => {
    const result = setupAB({ variants: [{ id: "all" }, { id: "none", trafficPercentage: 5 }] });
    expect(result.getSplitTestAssignment()).toBe(result.variant.id);
  });
});

describe("setupAB - applyToAuctionEvent", () => {
  it("stamps splitTestAssignment onto every bid in bidderRequests", () => {
    const result = setupAB({ variants: [{ id: "all" }, { id: "none", trafficPercentage: 5 }] });
    const bidA: any = { bidId: "bid-1" };
    const bidB: any = { bidId: "bid-2" };
    result.applyToAuctionEvent({ bidderRequests: [{ bids: [bidA, bidB] }] });
    expect(bidA.ortb2Imp.ext.optable.splitTestAssignment).toBe("all");
    expect(bidB.ortb2Imp.ext.optable.splitTestAssignment).toBe("all");
  });

  it("does not overwrite a splitTestAssignment already set on a bid", () => {
    const result = setupAB({ variants: [{ id: "all" }, { id: "none", trafficPercentage: 5 }] });
    const bid: any = { bidId: "bid-1", ortb2Imp: { ext: { optable: { splitTestAssignment: "control" } } } };
    result.applyToAuctionEvent({ bidderRequests: [{ bids: [bid] }] });
    expect(bid.ortb2Imp.ext.optable.splitTestAssignment).toBe("control");
  });

  it("preserves other fields on ortb2Imp.ext.optable", () => {
    const result = setupAB({ variants: [{ id: "all" }, { id: "none", trafficPercentage: 5 }] });
    const bid: any = { bidId: "bid-1", ortb2Imp: { ext: { optable: { foo: "bar" } } } };
    result.applyToAuctionEvent({ bidderRequests: [{ bids: [bid] }] });
    expect(bid.ortb2Imp.ext.optable).toEqual({ foo: "bar", splitTestAssignment: "all" });
  });

  it("handles a missing bidderRequests gracefully", () => {
    const result = setupAB({ variants: [{ id: "all" }, { id: "none", trafficPercentage: 5 }] });
    expect(() => result.applyToAuctionEvent({})).not.toThrow();
  });
});

describe("setupAB - setHooks", () => {
  it("registers an onEvent handler for auctionEnd", () => {
    const result = setupAB({ variants: [{ id: "all" }, { id: "none", trafficPercentage: 5 }] });
    const pbjs = { getEvents: () => [], onEvent: jest.fn() };
    result.setHooks(pbjs);
    expect(pbjs.onEvent).toHaveBeenCalledWith("auctionEnd", expect.any(Function));
  });

  it("replays past auctionEnd events from getEvents", () => {
    const result = setupAB({ variants: [{ id: "all" }, { id: "none", trafficPercentage: 5 }] });
    const bid: any = { bidId: "bid-1" };
    const pbjs = {
      getEvents: () => [{ eventType: "auctionEnd", args: { bidderRequests: [{ bids: [bid] }] } }],
      onEvent: jest.fn(),
    };
    result.setHooks(pbjs);
    expect(bid.ortb2Imp.ext.optable.splitTestAssignment).toBe("all");
  });
});

describe("determineABTest", () => {
  it("returns null when no abTests provided", () => {
    expect(determineABTest()).toBeNull();
    expect(determineABTest(undefined)).toBeNull();
    expect(determineABTest([])).toBeNull();
  });

  it("returns null when traffic percentage sum exceeds 100%", () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    expect(
      determineABTest([
        { id: "a", trafficPercentage: 60 },
        { id: "b", trafficPercentage: 50 },
      ])
    ).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith("AB Test Config Error: Traffic Percentage Sum Exceeds 100%");
    consoleSpy.mockRestore();
  });

  it("returns correct test based on random bucket", () => {
    const abTests = [
      { id: "test1", trafficPercentage: 30 },
      { id: "test2", trafficPercentage: 40 },
      { id: "test3", trafficPercentage: 20 },
    ];
    jest.spyOn(Math, "random").mockReturnValue(0.15);
    expect(determineABTest(abTests)).toEqual({ id: "test1", trafficPercentage: 30 });
    jest.spyOn(Math, "random").mockReturnValue(0.5);
    expect(determineABTest(abTests)).toEqual({ id: "test2", trafficPercentage: 40 });
    jest.spyOn(Math, "random").mockReturnValue(0.8);
    expect(determineABTest(abTests)).toEqual({ id: "test3", trafficPercentage: 20 });
    jest.spyOn(Math, "random").mockReturnValue(0.95);
    expect(determineABTest(abTests)).toBeNull();
  });

  it("handles single test configuration", () => {
    const abTests = [{ id: "single-test", trafficPercentage: 50 }];
    jest.spyOn(Math, "random").mockReturnValue(0.25);
    expect(determineABTest(abTests)).toEqual({ id: "single-test", trafficPercentage: 50 });
    jest.spyOn(Math, "random").mockReturnValue(0.75);
    expect(determineABTest(abTests)).toBeNull();
  });

  it("handles edge cases with 0% traffic", () => {
    jest.spyOn(Math, "random").mockReturnValue(0.5);
    expect(
      determineABTest([
        { id: "a", trafficPercentage: 0 },
        { id: "b", trafficPercentage: 100 },
      ])
    ).toEqual({
      id: "b",
      trafficPercentage: 100,
    });
  });

  it("handles tests with matcher_override and skipMatchers", () => {
    jest.spyOn(Math, "random").mockReturnValue(0.25);
    const abTests = [
      { id: "test1", trafficPercentage: 50, matcher_override: [{ id: "override1", rank: 1 }], skipMatchers: ["1p"] },
      { id: "test2", trafficPercentage: 50, matcher_override: [{ id: "override2", rank: 2 }], skipMatchers: ["1p"] },
    ];
    expect(determineABTest(abTests)).toEqual({
      id: "test1",
      trafficPercentage: 50,
      matcher_override: [{ id: "override1", rank: 1 }],
      skipMatchers: ["1p"],
    });
  });

  it("handles tests with skipResolvers", () => {
    jest.spyOn(Math, "random").mockReturnValue(0.25);
    expect(
      determineABTest([
        { id: "test1", trafficPercentage: 50, skipResolvers: ["resolver1"] },
        { id: "test2", trafficPercentage: 50, skipResolvers: ["resolver2"] },
      ])
    ).toEqual({ id: "test1", trafficPercentage: 50, skipResolvers: ["resolver1"] });
  });

  it("handles boundary conditions", () => {
    const abTests = [
      { id: "test1", trafficPercentage: 50 },
      { id: "test2", trafficPercentage: 50 },
    ];
    jest.spyOn(Math, "random").mockReturnValue(0.5);
    expect(determineABTest(abTests)).toEqual({ id: "test2", trafficPercentage: 50 });
    jest.spyOn(Math, "random").mockReturnValue(0.499);
    expect(determineABTest(abTests)).toEqual({ id: "test1", trafficPercentage: 50 });
  });

  it("handles floating point precision", () => {
    const abTests = [
      { id: "test1", trafficPercentage: 33.33 },
      { id: "test2", trafficPercentage: 33.33 },
      { id: "test3", trafficPercentage: 33.34 },
    ];
    jest.spyOn(Math, "random").mockReturnValue(0.333);
    expect(determineABTest(abTests)).toEqual({ id: "test1", trafficPercentage: 33.33 });
    jest.spyOn(Math, "random").mockReturnValue(0.666);
    expect(determineABTest(abTests)).toEqual({ id: "test2", trafficPercentage: 33.33 });
    jest.spyOn(Math, "random").mockReturnValue(0.999);
    expect(determineABTest(abTests)).toEqual({ id: "test3", trafficPercentage: 33.34 });
  });
});
