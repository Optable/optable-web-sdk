import { PrebidORTB2, TargetingKeyValues } from "./targeting";

describe("PrebidORTB2", () => {
  test("returns empty array on empty input", () => {
    const empty = { user: { data: [], ext: { eids: [] } } };
    expect(PrebidORTB2(null)).toEqual(empty);
    expect(PrebidORTB2({})).toEqual(empty);
  });

  test("returns for each targeting audiences a user segments compatible with ortb2.user.data", () => {
    const targeting = {
      audience: [{ ids: [{ id: "a" }, { id: "b" }, { id: "c" }], provider: "optable.co", rtb_segtax: 123 }],
      user: [{ provider: "uidapi.com", ids: [{ id: "d" }] }],
    };

    expect(PrebidORTB2(targeting)).toEqual({
      user: {
        data: [{ name: "optable.co", segment: [{ id: "a" }, { id: "b" }, { id: "c" }], ext: { segtax: 123 } }],
        ext: { eids: [{ source: "uidapi.com", uids: [{ id: "d", atype: 3 }] }] },
      },
    });
  });
});

describe("TargetingKeyValues", () => {
  test("returns empty object on empty input", () => {
    expect(TargetingKeyValues(null)).toEqual({});
    expect(TargetingKeyValues({})).toEqual({});
  });

  test("returns key values based on keyspace presence", () => {
    const targeting = {
      audience: [
        { ids: [{ id: "a" }, { id: "b" }, { id: "c" }], provider: "optable.co", keyspace: "k1" },
        { ids: [{ id: "d" }, { id: "e" }, { id: "f" }], provider: "optable.co", keyspace: "k1" },
        { ids: [{ id: "g" }, { id: "h" }, { id: "i" }], provider: "optable.co", keyspace: "k2" },
        { ids: [{ id: "j" }, { id: "k" }, { id: "l" }], provider: "optable.co" },
      ],
      user: [{ provider: "uidapi.com", ids: [{ id: "d" }] }],
    };
    expect(TargetingKeyValues(targeting)).toEqual({
      k1: ["a", "b", "c", "d", "e", "f"],
      k2: ["g", "h", "i"],
    });
  });
});

describe("determineABTest", () => {
  // Mock Math.random to control the random bucket selection
  let originalMathRandom;

  beforeEach(() => {
    originalMathRandom = Math.random;
  });

  afterEach(() => {
    Math.random = originalMathRandom;
  });

  test("returns null when no abTests provided", () => {
    const { determineABTest } = require("./targeting");
    expect(determineABTest()).toBeNull();
    expect(determineABTest(null)).toBeNull();
    expect(determineABTest([])).toBeNull();
  });

  test("returns null when traffic percentage sum exceeds 100%", () => {
    const { determineABTest } = require("./targeting");
    const abTests = [
      { id: "test1", trafficPercentage: 60 },
      { id: "test2", trafficPercentage: 50 }
    ];

    // Mock console.error to capture the error message
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(determineABTest(abTests)).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith("AB Test Config Error: Traffic Percentage Sum Exceeds 100%");

    consoleSpy.mockRestore();
  });

  test("returns correct test based on random bucket", () => {
    const { determineABTest } = require("./targeting");
    const abTests = [
      { id: "test1", trafficPercentage: 30 },
      { id: "test2", trafficPercentage: 40 },
      { id: "test3", trafficPercentage: 20 }
    ];

    // Test bucket 0-29 (first test)
    Math.random = jest.fn().mockReturnValue(0.15); // bucket = 15
    expect(determineABTest(abTests)).toEqual({ id: "test1", trafficPercentage: 30 });

    // Test bucket 30-69 (second test)
    Math.random = jest.fn().mockReturnValue(0.5); // bucket = 50
    expect(determineABTest(abTests)).toEqual({ id: "test2", trafficPercentage: 40 });

    // Test bucket 70-89 (third test)
    Math.random = jest.fn().mockReturnValue(0.8); // bucket = 80
    expect(determineABTest(abTests)).toEqual({ id: "test3", trafficPercentage: 20 });

    // Test bucket 90-99 (no test selected)
    Math.random = jest.fn().mockReturnValue(0.95); // bucket = 95
    expect(determineABTest(abTests)).toBeNull();
  });

  test("handles single test configuration", () => {
    const { determineABTest } = require("./targeting");
    const abTests = [{ id: "single-test", trafficPercentage: 50 }];

    // Test bucket 0-49 (test selected)
    Math.random = jest.fn().mockReturnValue(0.25); // bucket = 25
    expect(determineABTest(abTests)).toEqual({ id: "single-test", trafficPercentage: 50 });

    // Test bucket 50-99 (no test selected)
    Math.random = jest.fn().mockReturnValue(0.75); // bucket = 75
    expect(determineABTest(abTests)).toBeNull();
  });

  test("handles edge cases with 0% traffic", () => {
    const { determineABTest } = require("./targeting");
    const abTests = [
      { id: "test1", trafficPercentage: 0 },
      { id: "test2", trafficPercentage: 100 }
    ];

    // Any bucket should return test2 since test1 has 0% traffic
    Math.random = jest.fn().mockReturnValue(0.5); // bucket = 50
    expect(determineABTest(abTests)).toEqual({ id: "test2", trafficPercentage: 100 });
  });

  test("handles tests with matcher_override", () => {
    const { determineABTest } = require("./targeting");
    const abTests = [
      {
        id: "test1",
        trafficPercentage: 50,
        matcher_override: [{ id: "override1", rank: 1 }]
      },
      {
        id: "test2",
        trafficPercentage: 50,
        matcher_override: [{ id: "override2", rank: 2 }]
      }
    ];

    Math.random = jest.fn().mockReturnValue(0.25); // bucket = 25
    expect(determineABTest(abTests)).toEqual({
      id: "test1",
      trafficPercentage: 50,
      matcher_override: [{ id: "override1", rank: 1 }]
    });
  });

  test("handles boundary conditions", () => {
    const { determineABTest } = require("./targeting");
    const abTests = [
      { id: "test1", trafficPercentage: 50 },
      { id: "test2", trafficPercentage: 50 }
    ];

    // Test exact boundary at 50
    Math.random = jest.fn().mockReturnValue(0.5); // bucket = 50
    expect(determineABTest(abTests)).toEqual({ id: "test2", trafficPercentage: 50 });

    // Test just below boundary
    Math.random = jest.fn().mockReturnValue(0.499); // bucket = 49
    expect(determineABTest(abTests)).toEqual({ id: "test1", trafficPercentage: 50 });
  });

  test("handles floating point precision issues", () => {
    const { determineABTest } = require("./targeting");
    const abTests = [
      { id: "test1", trafficPercentage: 33.33 },
      { id: "test2", trafficPercentage: 33.33 },
      { id: "test3", trafficPercentage: 33.34 }
    ];

    // Test cumulative calculation with floating point
    Math.random = jest.fn().mockReturnValue(0.333); // bucket = 33
    expect(determineABTest(abTests)).toEqual({ id: "test1", trafficPercentage: 33.33 });

    Math.random = jest.fn().mockReturnValue(0.666); // bucket = 66
    expect(determineABTest(abTests)).toEqual({ id: "test2", trafficPercentage: 33.33 });

    Math.random = jest.fn().mockReturnValue(0.999); // bucket = 99
    expect(determineABTest(abTests)).toEqual({ id: "test3", trafficPercentage: 33.34 });
  });
});
