import { setupAB } from "./abTestAssignment.ts";
import { determineABTest } from "../edge/abTest";
import { resetFlags } from "../core/flags";

const STORAGE_KEY = "OPTABLE_SPLIT_TEST";

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  resetFlags();
  jest.spyOn(Math, "random").mockReturnValue(0.5);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("setupAB - traffic assignment", () => {
  it("assigns the treatment variant when random bucket falls in its range", () => {
    jest.spyOn(Math, "random").mockReturnValue(0.0);
    const result = setupAB({ variants: [{ id: "production" }, { id: "test", trafficPercentage: 5 }] });
    expect(result.variant.id).toBe("production");
    expect(result.isControl).toBe(false);
  });

  it("assigns the control variant when random bucket falls in its range", () => {
    jest.spyOn(Math, "random").mockReturnValue(0.97);
    const result = setupAB({ variants: [{ id: "production" }, { id: "test", trafficPercentage: 5 }] });
    expect(result.variant.id).toBe("test");
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
    setupAB({ variants: [{ id: "production" }, { id: "test", trafficPercentage: 5 }] });
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(stored.id).toBe("production");
  });

  it("returns the cached assignment on subsequent calls", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ id: "test", trafficPercentage: 5 }));
    const result = setupAB({ variants: [{ id: "production" }, { id: "test", trafficPercentage: 5 }] });
    expect(result.variant.id).toBe("test");
  });

  it("ignores a cached value whose id is not in the variants list", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ id: "stale", trafficPercentage: 50 }));
    jest.spyOn(Math, "random").mockReturnValue(0.0);
    const result = setupAB({ variants: [{ id: "production" }, { id: "test", trafficPercentage: 5 }] });
    expect(result.variant.id).toBe("production");
  });

  it("respects a custom storageKey", () => {
    const key = "MY_AB_TEST";
    setupAB({ variants: [{ id: "production" }, { id: "test", trafficPercentage: 5 }], storageKey: key });
    expect(localStorage.getItem(key)).not.toBeNull();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});

describe("setupAB - override via flags", () => {
  it("forces control when optableControlGroup flag is '1' (sessionStorage)", () => {
    sessionStorage.setItem("optableControlGroup", "1");
    resetFlags();
    const result = setupAB({ variants: [{ id: "production" }, { id: "test", trafficPercentage: 5 }] });
    expect(result.variant.id).toBe("test");
    expect(result.isControl).toBe(true);
  });

  it("forces treatment when optableControlGroup flag is '0' (sessionStorage)", () => {
    sessionStorage.setItem("optableControlGroup", "0");
    resetFlags();
    const result = setupAB({ variants: [{ id: "production" }, { id: "test", trafficPercentage: 5 }] });
    expect(result.variant.id).toBe("production");
    expect(result.isControl).toBe(false);
  });
});

describe("setupAB - custom variant ids", () => {
  it("uses controlId and treatmentId to resolve isControl and flag overrides", () => {
    sessionStorage.setItem("optableControlGroup", "0");
    resetFlags();
    const result = setupAB({
      variants: [{ id: "treatment" }, { id: "control", trafficPercentage: 10 }],
      controlId: "control",
      treatmentId: "treatment",
    });
    expect(result.variant.id).toBe("treatment");
    expect(result.isControl).toBe(false);
  });
});

describe("setupAB - control group cache clearing", () => {
  it("clears OPTABLE_RESOLVED and OPTABLE_TARGETING_* when assigned to control", () => {
    localStorage.setItem("OPTABLE_RESOLVED", "stale");
    localStorage.setItem("OPTABLE_TARGETING_abc123", "stale");
    localStorage.setItem("OPTABLE_TARGETING_def456", "stale");
    jest.spyOn(Math, "random").mockReturnValue(0.97); // control bucket
    setupAB({ variants: [{ id: "production" }, { id: "test", trafficPercentage: 5 }] });
    expect(localStorage.getItem("OPTABLE_RESOLVED")).toBeNull();
    expect(localStorage.getItem("OPTABLE_TARGETING_abc123")).toBeNull();
    expect(localStorage.getItem("OPTABLE_TARGETING_def456")).toBeNull();
  });

  it("does not clear targeting cache when assigned to treatment", () => {
    localStorage.setItem("OPTABLE_RESOLVED", "valid");
    localStorage.setItem("OPTABLE_TARGETING_abc123", "valid");
    jest.spyOn(Math, "random").mockReturnValue(0.0); // treatment bucket
    setupAB({ variants: [{ id: "production" }, { id: "test", trafficPercentage: 5 }] });
    expect(localStorage.getItem("OPTABLE_RESOLVED")).toBe("valid");
    expect(localStorage.getItem("OPTABLE_TARGETING_abc123")).toBe("valid");
  });

  it("calls sdk.targetingClearCache() instead of prefix scan when sdk is provided", () => {
    const mockSdk = { targetingClearCache: jest.fn() };
    jest.spyOn(Math, "random").mockReturnValue(0.97); // control bucket
    setupAB({ variants: [{ id: "production" }, { id: "test", trafficPercentage: 5 }], sdk: mockSdk });
    expect(mockSdk.targetingClearCache).toHaveBeenCalledTimes(1);
  });

  it("clears targeting cache when control is forced via flag override", () => {
    localStorage.setItem("OPTABLE_RESOLVED", "stale");
    sessionStorage.setItem("optableControlGroup", "1");
    resetFlags();
    setupAB({ variants: [{ id: "production" }, { id: "test", trafficPercentage: 5 }] });
    expect(localStorage.getItem("OPTABLE_RESOLVED")).toBeNull();
  });
});

describe("setupAB - splitTestAssignment", () => {
  it("exposes the assigned variant id as a string", () => {
    const result = setupAB({ variants: [{ id: "production" }, { id: "test", trafficPercentage: 5 }] });
    expect(result.splitTestAssignment).toBe(result.variant.id);
  });
});

describe("setupAB - setHooks", () => {
  it("registers an onEvent handler for auctionEnd", () => {
    const result = setupAB({ variants: [{ id: "production" }, { id: "test", trafficPercentage: 5 }] });
    const pbjs = { getEvents: () => [], onEvent: jest.fn() };
    result.setHooks(pbjs);
    expect(pbjs.onEvent).toHaveBeenCalledWith("auctionEnd", expect.any(Function));
  });

  it("replays past auctionEnd events from getEvents", () => {
    const result = setupAB({ variants: [{ id: "production" }, { id: "test", trafficPercentage: 5 }] });
    const bid: any = { bidId: "bid-1" };
    const pbjs = {
      getEvents: () => [{ eventType: "auctionEnd", args: { bidderRequests: [{ bids: [bid] }] } }],
      onEvent: jest.fn(),
    };
    result.setHooks(pbjs);
    expect(bid.ortb2Imp.ext.optable.splitTestAssignment).toBe("production");
  });

  it("stamps bids and does not overwrite an existing splitTestAssignment", () => {
    const result = setupAB({ variants: [{ id: "production" }, { id: "test", trafficPercentage: 5 }] });
    const bid: any = { bidId: "bid-1", ortb2Imp: { ext: { optable: { splitTestAssignment: "control" } } } };
    const pbjs = {
      getEvents: () => [{ eventType: "auctionEnd", args: { bidderRequests: [{ bids: [bid] }] } }],
      onEvent: jest.fn(),
    };
    result.setHooks(pbjs);
    expect(bid.ortb2Imp.ext.optable.splitTestAssignment).toBe("control");
  });

  it("registers hooks automatically  when pbjs is passed to setupAB", () => {
    const pbjs = { getEvents: () => [], onEvent: jest.fn() };
    setupAB({ variants: [{ id: "production" }, { id: "test", trafficPercentage: 5 }], pbjs });
    expect(pbjs.onEvent).toHaveBeenCalledWith("auctionEnd", expect.any(Function));
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
