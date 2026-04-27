import { mergeWithCache } from "./eid-cache";
import type { EidCacheConfig } from "./eid-cache";
import type { TargetingResponse } from "../edge/targeting";

const createTargetingResponse = ({
  data = [],
  eids = [],
  refs = undefined,
  resolved_ids = [],
}: {
  data?: any;
  eids?: any;
  refs?: any;
  resolved_ids?: any;
}): TargetingResponse => {
  return {
    refs,
    resolved_ids,
    ortb2: {
      user: {
        data,
        eids,
      },
    },
  };
};

const mockLocalStorage = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
});

beforeEach(() => {
  mockLocalStorage.clear();
});

describe("mergeWithCache", () => {
  const enabledConfig: EidCacheConfig = { enabled: true };

  test("returns fresh response when cache is disabled", () => {
    const freshResponse = createTargetingResponse({
      eids: [{ source: "uid2.com", matcher: "matcher_one", uids: [{ id: "uid123" }] }],
    });

    const result = mergeWithCache(freshResponse, { enabled: false });

    expect(result).toEqual(freshResponse);
  });

  test("fresh response with empty cache returns fresh response and writes to localStorage", () => {
    const freshResponse = createTargetingResponse({
      eids: [{ source: "uid2.com", matcher: "matcher_one", uids: [{ id: "uid123" }] }],
    });

    const result = mergeWithCache(freshResponse, enabledConfig);

    expect(result.ortb2.user.eids).toEqual([
      { source: "uid2.com", matcher: "matcher_one", uids: [{ id: "uid123" }] },
    ]);

    const stored = JSON.parse(mockLocalStorage.getItem("OPTABLE_RESOLVED")!);
    expect(stored.ortb2.user.eids).toHaveLength(1);

    const timestamps = JSON.parse(mockLocalStorage.getItem("OPTABLE_TIMESTAMPS")!);
    expect(timestamps["matcher_one::uid2.com"]).toBeDefined();
  });

  test("fresh response with valid cached EIDs merges correctly", () => {
    const now = Date.now();
    mockLocalStorage.setItem(
      "OPTABLE_RESOLVED",
      JSON.stringify({
        ortb2: {
          user: {
            eids: [{ source: "id5-sync.com", matcher: "matcher_cached", uids: [{ id: "cached_id" }] }],
          },
        },
      })
    );
    mockLocalStorage.setItem("OPTABLE_TIMESTAMPS", JSON.stringify({ "matcher_cached::id5-sync.com": now }));

    const freshResponse = createTargetingResponse({
      eids: [{ source: "uid2.com", matcher: "matcher_fresh", uids: [{ id: "fresh_id" }] }],
    });

    const result = mergeWithCache(freshResponse, enabledConfig);

    expect(result.ortb2.user.eids).toHaveLength(2);
    expect(result.ortb2.user.eids).toContainEqual({
      source: "id5-sync.com",
      matcher: "matcher_cached",
      uids: [{ id: "cached_id" }],
    });
    expect(result.ortb2.user.eids).toContainEqual({
      source: "uid2.com",
      matcher: "matcher_fresh",
      uids: [{ id: "fresh_id" }],
    });
  });

  test("fresh response overrides cached EID on collision", () => {
    const now = Date.now();
    mockLocalStorage.setItem(
      "OPTABLE_RESOLVED",
      JSON.stringify({
        ortb2: {
          user: {
            eids: [{ source: "uid2.com", matcher: "matcher_one", uids: [{ id: "old_id" }] }],
          },
        },
      })
    );
    mockLocalStorage.setItem("OPTABLE_TIMESTAMPS", JSON.stringify({ "matcher_one::uid2.com": now }));

    const freshResponse = createTargetingResponse({
      eids: [{ source: "uid2.com", matcher: "matcher_one", uids: [{ id: "new_id" }] }],
    });

    const result = mergeWithCache(freshResponse, enabledConfig);

    expect(result.ortb2.user.eids).toHaveLength(1);
    expect(result.ortb2.user.eids[0].uids[0].id).toBe("new_id");
  });

  test("cached EIDs past TTL are evicted", () => {
    const pastTime = Date.now() - 8 * 24 * 60 * 60 * 1000;
    mockLocalStorage.setItem(
      "OPTABLE_RESOLVED",
      JSON.stringify({
        ortb2: {
          user: {
            eids: [{ source: "id5-sync.com", matcher: "matcher_old", uids: [{ id: "old_id" }] }],
          },
        },
      })
    );
    mockLocalStorage.setItem("OPTABLE_TIMESTAMPS", JSON.stringify({ "matcher_old::id5-sync.com": pastTime }));

    const freshResponse = createTargetingResponse({
      eids: [{ source: "uid2.com", matcher: "matcher_fresh", uids: [{ id: "fresh_id" }] }],
    });

    const result = mergeWithCache(freshResponse, enabledConfig);

    expect(result.ortb2.user.eids).toHaveLength(1);
    expect(result.ortb2.user.eids[0].source).toBe("uid2.com");

    const timestamps = JSON.parse(mockLocalStorage.getItem("OPTABLE_TIMESTAMPS")!);
    expect(timestamps["matcher_old::id5-sync.com"]).toBeUndefined();
  });

  test("cached EIDs within TTL and not in fresh response are preserved", () => {
    const now = Date.now();
    mockLocalStorage.setItem(
      "OPTABLE_RESOLVED",
      JSON.stringify({
        ortb2: {
          user: {
            eids: [{ source: "id5-sync.com", matcher: "matcher_cached", uids: [{ id: "cached_id" }] }],
          },
        },
      })
    );
    mockLocalStorage.setItem("OPTABLE_TIMESTAMPS", JSON.stringify({ "matcher_cached::id5-sync.com": now }));

    const freshResponse = createTargetingResponse({
      eids: [{ source: "uid2.com", matcher: "matcher_fresh", uids: [{ id: "fresh_id" }] }],
    });

    const result = mergeWithCache(freshResponse, enabledConfig);

    expect(result.ortb2.user.eids).toHaveLength(2);
    expect(result.ortb2.user.eids.map((e) => e.source)).toContain("id5-sync.com");
    expect(result.ortb2.user.eids.map((e) => e.source)).toContain("uid2.com");
  });

  test("per-source TTL override works", () => {
    const shortTime = Date.now() - 2 * 24 * 60 * 60 * 1000;
    mockLocalStorage.setItem(
      "OPTABLE_RESOLVED",
      JSON.stringify({
        ortb2: {
          user: {
            eids: [{ source: "custom.com", matcher: "matcher_custom", uids: [{ id: "custom_id" }] }],
          },
        },
      })
    );
    mockLocalStorage.setItem("OPTABLE_TIMESTAMPS", JSON.stringify({ "matcher_custom::custom.com": shortTime }));

    const freshResponse = createTargetingResponse({
      eids: [],
    });

    const configWithCustomTTL: EidCacheConfig = {
      enabled: true,
      ttl: { "custom.com": 1 * 24 * 60 * 60 * 1000 },
    };

    const result = mergeWithCache(freshResponse, configWithCustomTTL);

    expect(result.ortb2.user.eids).toHaveLength(0);
  });

  test("custom storage keys work", () => {
    const customConfig: EidCacheConfig = {
      enabled: true,
      storageKey: "CUSTOM_RESOLVED",
      timestampKey: "CUSTOM_TIMESTAMPS",
    };

    const freshResponse = createTargetingResponse({
      eids: [{ source: "uid2.com", matcher: "matcher_one", uids: [{ id: "uid123" }] }],
    });

    mergeWithCache(freshResponse, customConfig);

    expect(mockLocalStorage.getItem("CUSTOM_RESOLVED")).toBeDefined();
    expect(mockLocalStorage.getItem("CUSTOM_TIMESTAMPS")).toBeDefined();
    expect(mockLocalStorage.getItem("OPTABLE_RESOLVED")).toBeNull();
  });

  test("key format matcher::source is correct", () => {
    const freshResponse = createTargetingResponse({
      eids: [{ source: "uid2.com", matcher: "matcher_one", uids: [{ id: "uid123" }] }],
    });

    mergeWithCache(freshResponse, enabledConfig);

    const timestamps = JSON.parse(mockLocalStorage.getItem("OPTABLE_TIMESTAMPS")!);
    expect(Object.keys(timestamps)).toContain("matcher_one::uid2.com");
  });

  test("handles malformed localStorage gracefully", () => {
    mockLocalStorage.setItem("OPTABLE_RESOLVED", "invalid json");
    mockLocalStorage.setItem("OPTABLE_TIMESTAMPS", "{invalid}");

    const freshResponse = createTargetingResponse({
      eids: [{ source: "uid2.com", matcher: "matcher_one", uids: [{ id: "uid123" }] }],
    });

    const result = mergeWithCache(freshResponse, enabledConfig);

    expect(result.ortb2.user.eids).toHaveLength(1);
    expect(result.ortb2.user.eids[0].uids[0].id).toBe("uid123");
  });

  test("handles missing localStorage gracefully", () => {
    const freshResponse = createTargetingResponse({
      eids: [{ source: "uid2.com", matcher: "matcher_one", uids: [{ id: "uid123" }] }],
    });

    const result = mergeWithCache(freshResponse, enabledConfig);

    expect(result.ortb2.user.eids).toHaveLength(1);
  });

  test("ignores EIDs with no uids", () => {
    mockLocalStorage.setItem(
      "OPTABLE_RESOLVED",
      JSON.stringify({
        ortb2: {
          user: {
            eids: [{ source: "uid2.com", matcher: "matcher_empty", uids: [] }],
          },
        },
      })
    );
    mockLocalStorage.setItem("OPTABLE_TIMESTAMPS", JSON.stringify({ "matcher_empty::uid2.com": Date.now() }));

    const freshResponse = createTargetingResponse({
      eids: [{ source: "id5-sync.com", matcher: "matcher_fresh", uids: [{ id: "fresh_id" }] }],
    });

    const result = mergeWithCache(freshResponse, enabledConfig);

    expect(result.ortb2.user.eids).toHaveLength(1);
    expect(result.ortb2.user.eids[0].source).toBe("id5-sync.com");
  });
});
