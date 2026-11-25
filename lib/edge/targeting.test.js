import { PrebidORTB2, TargetingKeyValues, Targeting, SkipTargetingForBots, TargetingOncePerSession } from "./targeting";
import { resetFlags } from "../core/flags";

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

describe("SkipTargetingForBots", () => {
  const TARGETING_DONE_KEY = "OPTABLE_TARGETING_DONE";

  beforeEach(() => {
    sessionStorage.clear();
    jest.restoreAllMocks();
  });

  it("marks targeting as done and returns true for a bot", () => {
    jest.spyOn(navigator, "userAgent", "get").mockReturnValue("Googlebot/2.1");
    expect(SkipTargetingForBots()).toBe(true);
    expect(sessionStorage.getItem(TARGETING_DONE_KEY)).toBe("1");
  });

  it("is a no-op and returns false for a real user", () => {
    jest
      .spyOn(navigator, "userAgent", "get")
      .mockReturnValue(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      );
    expect(SkipTargetingForBots()).toBe(false);
    expect(sessionStorage.getItem(TARGETING_DONE_KEY)).toBeNull();
  });
});

describe("Targeting function handles optional params like targeting signals and skipMatchers", () => {
  let originalWindow;
  let originalLocation;
  let mockFetch;

  const baseConfig = {
    host: "api.example.com",
    site: "test-site",
    sessionID: "test-session",
    consent: {
      reg: null,
      deviceAccess: true,
      createProfilesForAdvertising: true,
      useProfilesForAdvertising: true,
      measureAdvertisingPerformance: true,
    },
    cookies: true,
    initPassport: true,
    readOnly: false,
    experiments: [],
    optableCacheTargeting: "optable-cache:targeting",
  };

  const baseReq = {
    ids: ["user123"],
    hids: ["household456"],
  };

  // Helper function to create a proper mock response
  const createMockResponse = (data) => ({
    ok: true,
    headers: {
      get: jest.fn().mockReturnValue("application/json"),
    },
    json: jest.fn().mockResolvedValue(data),
  });

  beforeEach(() => {
    // Mock window.location
    originalWindow = global.window;
    // In jsdom environment, window already exists, so we need to modify it
    if (global.window) {
      originalLocation = global.window.location;
      // Override the location properties directly
      Object.defineProperty(global.window, "location", {
        value: {
          protocol: "https:",
          host: "example.com",
          pathname: "/test-page",
        },
        writable: true,
        configurable: true,
      });
    } else {
      global.window = {
        location: {
          protocol: "https:",
          host: "example.com",
          pathname: "/test-page",
        },
      };
    }

    // Mock fetch
    mockFetch = jest.fn();
    global.fetch = mockFetch;
  });

  afterEach(() => {
    if (originalLocation) {
      global.window.location = originalLocation;
    } else {
      global.window = originalWindow;
    }
    jest.clearAllMocks();
  });

  const eidResponse = (source, id) => ({ ortb2: { user: { eids: [{ source, uids: [{ id }] }] } } });
  const cachedSources = () =>
    JSON.parse(localStorage.getItem("optable-cache:targeting"))
      .ortb2.user.eids.map((e) => e.source)
      .sort();

  test("carries cached EIDs over when no A/B arm restricted resolution", async () => {
    localStorage.clear();
    mockFetch.mockResolvedValue(createMockResponse(eidResponse("uidapi.com", "u1")));
    await Targeting({ ...baseConfig }, { ...baseReq });

    mockFetch.mockResolvedValue(createMockResponse(eidResponse("liveramp.com", "l1")));
    await Targeting({ ...baseConfig }, { ...baseReq });

    expect(cachedSources()).toEqual(["liveramp.com", "uidapi.com"]);
  });

  test("replaces the cache when the A/B arm skipped matchers", async () => {
    localStorage.clear();
    mockFetch.mockResolvedValue(createMockResponse(eidResponse("uidapi.com", "u1")));
    await Targeting({ ...baseConfig }, { ...baseReq });

    mockFetch.mockResolvedValue(createMockResponse(eidResponse("liveramp.com", "l1")));
    await Targeting(
      { ...baseConfig, abTests: [{ id: "skip-1p", trafficPercentage: 100, skipMatchers: ["1p"] }] },
      { ...baseReq }
    );

    expect(cachedSources()).toEqual(["liveramp.com"]);
  });

  test("still carries EIDs over for an A/B arm that only buckets traffic", async () => {
    localStorage.clear();
    mockFetch.mockResolvedValue(createMockResponse(eidResponse("uidapi.com", "u1")));
    await Targeting({ ...baseConfig }, { ...baseReq });

    mockFetch.mockResolvedValue(createMockResponse(eidResponse("liveramp.com", "l1")));
    await Targeting({ ...baseConfig, abTests: [{ id: "holdout", trafficPercentage: 100 }] }, { ...baseReq });

    expect(cachedSources()).toEqual(["liveramp.com", "uidapi.com"]);
  });

  test("the change event reports the merged cache, not the raw response", async () => {
    localStorage.clear();
    mockFetch.mockResolvedValue(createMockResponse(eidResponse("uidapi.com", "u1")));
    await Targeting({ ...baseConfig }, { ...baseReq });

    const seen = [];
    const listener = (e) => seen.push(e.detail);
    window.addEventListener("optable-targeting:change", listener);

    mockFetch.mockResolvedValue(createMockResponse(eidResponse("liveramp.com", "l1")));
    await Targeting({ ...baseConfig }, { ...baseReq });
    window.removeEventListener("optable-targeting:change", listener);

    expect(seen).toHaveLength(1);
    expect(seen[0].ortb2.user.eids.map((e) => e.source).sort()).toEqual(["liveramp.com", "uidapi.com"]);
  });

  test("the change event reports resolved when only carried-over EIDs remain", async () => {
    localStorage.clear();
    mockFetch.mockResolvedValue(createMockResponse(eidResponse("uidapi.com", "u1")));
    await Targeting({ ...baseConfig }, { ...baseReq });

    const seen = [];
    const listener = (e) => seen.push(e.detail);
    window.addEventListener("optable-targeting:change", listener);

    mockFetch.mockResolvedValue(createMockResponse({ audience: [], ortb2: { user: {} } }));
    await Targeting({ ...baseConfig }, { ...baseReq });
    window.removeEventListener("optable-targeting:change", listener);

    expect(seen[0].resolved).toBe(true);
  });

  test("includes Ref parameter when additionalTargetingSignals.ref is true", async () => {
    mockFetch.mockResolvedValue(createMockResponse({ audience: [], user: [] }));

    await Targeting(
      {
        ...baseConfig,
        additionalTargetingSignals: {
          ref: true,
        },
      },
      { ...baseReq }
    );

    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringContaining(
          "/v2/targeting?id=user123&hid=household456&ref=https%3A%2F%2Fexample.com%2Ftest-page"
        ),
      })
    );
  });

  test("does not include Ref parameter when additionalTargetingSignals.ref is false", async () => {
    mockFetch.mockResolvedValue(createMockResponse({ audience: [], user: [] }));

    await Targeting(
      {
        ...baseConfig,
        additionalTargetingSignals: {
          ref: false,
        },
      },
      { ...baseReq }
    );

    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.not.stringContaining("ref="),
      })
    );

    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringContaining("/v2/targeting?id=user123&hid=household456"),
      })
    );
  });

  test("does not include Ref parameter when additionalTargetingSignals.ref is undefined", async () => {
    mockFetch.mockResolvedValue(createMockResponse({ audience: [], user: [] }));

    await Targeting(
      {
        ...baseConfig,
        additionalTargetingSignals: {
          ref: undefined,
        },
      },
      { ...baseReq }
    );

    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringContaining("/v2/targeting?id=user123&hid=household456"),
      })
    );

    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.not.stringContaining("ref="),
      })
    );
  });

  test("includes environment=web when additionalTargetingSignals.webEnvironment is true", async () => {
    mockFetch.mockResolvedValue(createMockResponse({ audience: [], user: [] }));

    await Targeting({ ...baseConfig, additionalTargetingSignals: { webEnvironment: true } }, { ...baseReq });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringContaining("/v2/targeting?id=user123&hid=household456&environment=web"),
      })
    );
  });

  test("does not include environment when additionalTargetingSignals.webEnvironment is unset", async () => {
    mockFetch.mockResolvedValue(createMockResponse({ audience: [], user: [] }));

    await Targeting({ ...baseConfig, additionalTargetingSignals: { ref: true } }, { ...baseReq });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.not.stringContaining("environment="),
      })
    );
  });

  test("does not include Ref parameter when additionalTargetingSignals is not provided", async () => {
    mockFetch.mockResolvedValue(createMockResponse({ audience: [], user: [] }));

    await Targeting(
      {
        ...baseConfig,
        additionalTargetingSignals: undefined,
      },
      { ...baseReq }
    );

    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringContaining("/v2/targeting?id=user123&hid=household456"),
      })
    );

    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.not.stringContaining("ref="),
      })
    );
  });

  test("correctly encodes Ref with special characters", async () => {
    // Mock window.location with special characters
    global.window.location = {
      protocol: "https:",
      host: "example.com",
      pathname: "/path with spaces/and&special=chars",
    };
    mockFetch.mockResolvedValue(createMockResponse({ audience: [], user: [] }));

    await Targeting(
      {
        ...baseConfig,
        additionalTargetingSignals: {
          ref: true,
        },
      },
      { ...baseReq }
    );

    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringContaining("ref=https%3A%2F%2Fexample.com%2Fpath+with+spaces%2Fand%26special%3Dchars"),
      })
    );
  });

  test("includes skip_matchers parameter when abTest.skipMatchers is provided", async () => {
    mockFetch.mockResolvedValue(createMockResponse({ audience: [], user: [] }));

    await Targeting(
      {
        ...baseConfig,
        abTests: [{ id: "test1", trafficPercentage: 100, skipMatchers: ["1p"] }],
      },
      { ...baseReq }
    );

    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringContaining("skip_matchers=1p"),
      })
    );
  });

  test("includes skip_matchers parameter when abTest.skipMatchers contains multiple matchers", async () => {
    mockFetch.mockResolvedValue(createMockResponse({ audience: [], user: [] }));

    await Targeting(
      {
        ...baseConfig,
        abTests: [{ id: "test1", trafficPercentage: 100, skipMatchers: ["matcher1", "matcher2"] }],
      },
      { ...baseReq }
    );

    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringContaining("skip_matchers="),
      })
    );
    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringContaining(encodeURIComponent("matcher1,matcher2")),
      })
    );
  });

  test("includes skip_matchers parameter when abTest.skipMatchers is not provided", async () => {
    mockFetch.mockResolvedValue(createMockResponse({ audience: [], user: [] }));

    await Targeting(
      {
        ...baseConfig,
        abTests: [{ id: "test1", trafficPercentage: 100 }],
      },
      { ...baseReq }
    );

    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.not.stringContaining("skip_matchers="),
      })
    );
  });

  test("includes skip_resolvers parameter when abTest.skipResolvers is provided", async () => {
    mockFetch.mockResolvedValue(createMockResponse({ audience: [], user: [] }));

    await Targeting(
      {
        ...baseConfig,
        abTests: [{ id: "test1", trafficPercentage: 100, skipResolvers: ["resolver1"] }],
      },
      { ...baseReq }
    );

    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringContaining("skip_resolvers=resolver1"),
      })
    );
  });

  test("includes skip_resolvers parameter when abTest.skipResolvers contains multiple resolvers", async () => {
    mockFetch.mockResolvedValue(createMockResponse({ audience: [], user: [] }));

    await Targeting(
      {
        ...baseConfig,
        abTests: [{ id: "test1", trafficPercentage: 100, skipResolvers: ["resolver1", "resolver2"] }],
      },
      { ...baseReq }
    );

    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringContaining("skip_resolvers="),
      })
    );
    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringContaining(encodeURIComponent("resolver1,resolver2")),
      })
    );
  });

  test("does not include skip_resolvers parameter when abTest.skipResolvers is not provided", async () => {
    mockFetch.mockResolvedValue(createMockResponse({ audience: [], user: [] }));

    await Targeting(
      {
        ...baseConfig,
        abTests: [{ id: "test1", trafficPercentage: 100 }],
      },
      { ...baseReq }
    );

    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.not.stringContaining("skip_resolvers="),
      })
    );
  });

  test("sends the ID5 signature from the previous response as id5_signature", async () => {
    const config = {
      ...baseConfig,
      host: "id5-signature.example.com",
      additionalTargetingSignals: { id5Signature: true },
    };
    mockFetch.mockResolvedValue(
      createMockResponse({
        ortb2: {
          user: { eids: [{ source: "id5-sync.com", uids: [{ id: "ID5*abc", ext: { optable: { ref: "0" } } }] }] },
        },
        refs: { 0: { signature: "ID5_sig" } },
      })
    );

    await Targeting(config, { ...baseReq });
    expect(mockFetch).toHaveBeenLastCalledWith(
      expect.objectContaining({
        url: expect.not.stringContaining("id5_signature="),
      })
    );

    await Targeting(config, { ...baseReq });
    expect(mockFetch).toHaveBeenLastCalledWith(
      expect.objectContaining({
        url: expect.stringContaining("id5_signature=ID5_sig"),
      })
    );

    await Targeting({ ...config, additionalTargetingSignals: undefined }, { ...baseReq });
    expect(mockFetch).toHaveBeenLastCalledWith(
      expect.objectContaining({
        url: expect.not.stringContaining("id5_signature="),
      })
    );
  });

  test("includes both skip_matchers and skip_resolvers when both are provided", async () => {
    mockFetch.mockResolvedValue(createMockResponse({ audience: [], user: [] }));

    await Targeting(
      {
        ...baseConfig,
        abTests: [
          {
            id: "test1",
            trafficPercentage: 100,
            skipMatchers: ["matcher1", "matcher2"],
            skipResolvers: ["resolver1", "resolver2"],
          },
        ],
      },
      { ...baseReq }
    );

    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringContaining("skip_matchers="),
      })
    );
    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringContaining("skip_resolvers="),
      })
    );
    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringContaining(encodeURIComponent("matcher1,matcher2")),
      })
    );
    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringContaining(encodeURIComponent("resolver1,resolver2")),
      })
    );
  });
});

describe("TargetingOncePerSession", () => {
  beforeEach(() => {
    sessionStorage.clear();
    resetFlags();
  });

  it("resolves once and marks the session, skipping the second call", async () => {
    const response = { ortb2: { user: {} } };
    const targeting = jest.fn().mockResolvedValue(response);

    await expect(TargetingOncePerSession({ targeting })).resolves.toBe(response);

    await expect(TargetingOncePerSession({ targeting })).resolves.toBeNull();
    expect(targeting).toHaveBeenCalledTimes(1);
  });

  it("forwards the targeting input", async () => {
    const targeting = jest.fn().mockResolvedValue({});
    await TargetingOncePerSession({ targeting }, "c:abc");
    expect(targeting).toHaveBeenCalledWith("c:abc");
  });

  it("resolves null without marking the session when the call fails", async () => {
    const targeting = jest.fn().mockRejectedValue(new Error("edge down"));

    await expect(TargetingOncePerSession({ targeting })).resolves.toBeNull();
    expect(sessionStorage.getItem("OPTABLE_TARGETING_DONE")).toBeNull();

    // The guard is untouched, so a later page can retry.
    await TargetingOncePerSession({ targeting });
    expect(targeting).toHaveBeenCalledTimes(2);
  });

  it("marks the session so a later call is skipped, observable in sessionStorage", async () => {
    const targeting = jest.fn().mockResolvedValue({});
    await TargetingOncePerSession({ targeting });

    expect(sessionStorage.getItem("OPTABLE_TARGETING_DONE")).toBe("1");
  });

  it("skips the call for a bot, since the bot guard sets the same marker", async () => {
    jest.spyOn(navigator, "userAgent", "get").mockReturnValue("Googlebot/2.1");
    SkipTargetingForBots();
    jest.restoreAllMocks();

    const targeting = jest.fn();
    await expect(TargetingOncePerSession({ targeting })).resolves.toBeNull();
    expect(targeting).not.toHaveBeenCalled();
  });

  it("optableForceTargeting re-runs it", async () => {
    sessionStorage.setItem("OPTABLE_TARGETING_DONE", "1");
    sessionStorage.setItem("optableForceTargeting", "1");
    resetFlags();

    const targeting = jest.fn().mockResolvedValue({});
    await TargetingOncePerSession({ targeting });
    expect(targeting).toHaveBeenCalledTimes(1);
  });
});
