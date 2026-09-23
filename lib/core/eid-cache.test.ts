import { getRefData, isUid2Stale, mergeCache, replaceCache, resolveRefs } from "./eid-cache";

const ref = (over: Record<string, unknown> = {}) => ({
  advertising_token: "adv",
  refresh_token: "rt",
  refresh_response_key: "rk",
  refresh_from: Date.now() + 60_000,
  refresh_expires: Date.now() + 120_000,
  identity_expires: Date.now() + 120_000,
  ...over,
});

const eid = (source: string, over: Record<string, unknown> = {}) => ({
  source,
  uids: [{ id: `${source}-id`, atype: 3 }],
  ...over,
});

// An EID pointing at the response refs map, the way the wire carries it.
const refEid = (source: string, refKey: string) => ({
  source,
  uids: [{ id: `${source}-id`, ext: { optable: { ref: refKey } } }],
});

const cache = (eids: unknown[], over: Record<string, unknown> = {}) => ({
  ortb2: { user: { data: [], eids } },
  ...over,
});

describe("resolveRefs", () => {
  it("builds a source-keyed refs map from EIDs referencing the response refs", () => {
    const refs = { "0": ref() };
    const bySource = resolveRefs([refEid("uidapi.com", "0"), eid("liveramp.com")] as any, refs as any);
    expect(bySource).toEqual({ "uidapi.com": refs["0"] });
  });

  it("returns an empty map without a refs map", () => {
    expect(resolveRefs([eid("uidapi.com")] as any)).toEqual({});
  });

  it("ignores malformed and inherited-key refs", () => {
    const bySource = resolveRefs(
      [refEid("uidapi.com", "0"), refEid("id5-sync.com", "constructor")] as any,
      { "0": { refresh_token: "rt" } } as any
    );
    expect(bySource).toEqual({});
  });
});

describe("getRefData", () => {
  it("returns the source's ref only when it can drive a refresh", () => {
    expect(getRefData({ refs: { "uidapi.com": ref() } }, "uidapi.com")).not.toBeNull();
    expect(getRefData({ refs: { "uidapi.com": ref({ refresh_token: "" }) } }, "uidapi.com")).toBeNull();
    expect(getRefData({ refs: {} }, "uidapi.com")).toBeNull();
    expect(getRefData(null, "uidapi.com")).toBeNull();
  });
});

describe("isUid2Stale", () => {
  it("is true past refresh_from and false before", () => {
    expect(isUid2Stale({ refs: { "uidapi.com": ref({ refresh_from: Date.now() - 1 }) } })).toBe(true);
    expect(isUid2Stale({ refs: { "uidapi.com": ref() } })).toBe(false);
    expect(isUid2Stale({ refs: {} })).toBe(false);
  });

  it("treats a ref without refresh_from as stale", () => {
    expect(isUid2Stale({ refs: { "uidapi.com": ref({ refresh_from: 0 }) } })).toBe(true);
  });
});

describe("replaceCache", () => {
  it("normalizes a wire response: source-keyed refs, pointers stripped, other fields kept", () => {
    const wireRef = ref();
    const response = {
      audience: [{ provider: "optable" }],
      ab_test_id: "ab-1",
      ortb2: { user: { data: [{ seg: 1 }], eids: [refEid("uidapi.com", "0"), eid("liveramp.com")] } },
      refs: { "0": wireRef },
    };

    const normalized = replaceCache(response as any);

    expect(normalized.refs).toEqual({ "uidapi.com": wireRef });
    expect((normalized as any).audience).toEqual([{ provider: "optable" }]);
    expect((normalized as any).ab_test_id).toBe("ab-1");
    expect(normalized.ortb2?.user?.data).toEqual([{ seg: 1 }]);
    expect(normalized.ortb2?.user?.eids?.[0]?.uids?.[0]?.ext).toBeUndefined();
    expect(normalized.ortb2?.user?.eids?.map((e) => e.source)).toEqual(["uidapi.com", "liveramp.com"]);
  });

  it("drops a legacy _ref so no consumer has to strip it", () => {
    const legacy = { ortb2: { user: { eids: [{ source: "uidapi.com", uids: [{ id: "x" }], _ref: ref() }] } } };

    const normalized = replaceCache(legacy as any);

    expect("_ref" in (normalized.ortb2!.user!.eids![0] as any)).toBe(false);
  });

  it("does not mutate the response and yields empty refs without pointers", () => {
    const wire = refEid("uidapi.com", "0");
    const response = { ortb2: { user: { eids: [wire] } }, refs: { "0": ref() } };

    const normalized = replaceCache(response as any);

    expect(wire.uids[0].ext.optable.ref).toBe("0");
    expect(normalized).not.toBe(response);

    expect(replaceCache({ ortb2: { user: { eids: [eid("a")] } } } as any).refs).toEqual({});
    expect(replaceCache({} as any).refs).toEqual({});
  });

  it("is idempotent: a cache-format value keeps its refs", () => {
    const wireRef = ref();
    const once = replaceCache(cache([refEid("uidapi.com", "0")], { refs: { "0": wireRef } }) as any);

    expect(replaceCache(once)).toEqual(once);
    expect(replaceCache(replaceCache(once)).refs).toEqual({ "uidapi.com": wireRef });
  });
});

describe("mergeCache", () => {
  it("replaces cached EIDs by source and carries over the rest", () => {
    const oldCache = cache([eid("uidapi.com", { uids: [{ id: "old" }] }), eid("liveramp.com")]);
    const newCache = cache([eid("uidapi.com", { uids: [{ id: "new" }] }), eid("id5-sync.com")]);
    const { merged } = mergeCache(newCache as any, oldCache as any);
    const eids = merged.ortb2?.user?.eids || [];
    expect(eids.map((e) => e.source).sort()).toEqual(["id5-sync.com", "liveramp.com", "uidapi.com"]);
    expect(eids.find((e) => e.source === "uidapi.com")?.uids?.[0]?.id).toBe("new");
  });

  it("drops EIDs without uids", () => {
    const { merged } = mergeCache(
      cache([eid("a", { uids: [] })]) as any,
      cache([eid("b", { uids: undefined })]) as any
    );
    expect(merged.ortb2?.user?.eids).toEqual([]);
  });

  it("truncates uids to the default of 2 and honors maxUidsPerEid", () => {
    const three = eid("a", { uids: [{ id: "1" }, { id: "2" }, { id: "3" }] });
    expect(mergeCache(cache([three]) as any, null).merged.ortb2?.user?.eids?.[0]?.uids).toHaveLength(2);
    expect(
      mergeCache(cache([three]) as any, null, { maxUidsPerEid: 1 }).merged.ortb2?.user?.eids?.[0]?.uids
    ).toHaveLength(1);
  });

  it("keeps merged EIDs wire-clean: refs live in the sidecar, not on EIDs", () => {
    const wireRef = ref();
    const newCache = replaceCache(cache([refEid("uidapi.com", "0")], { refs: { "0": wireRef } }) as any);
    const { merged } = mergeCache(newCache, null);

    const uid2 = merged.ortb2?.user?.eids?.[0] as any;
    expect(uid2._ref).toBeUndefined();
    expect(uid2.uids[0].ext).toBeUndefined();
    expect(getRefData(merged, "uidapi.com")).toEqual(wireRef);
  });

  it("does not mutate the caller's response", () => {
    const wire = refEid("uidapi.com", "0");
    const newCache = cache([wire], { refs: { "0": ref() } });

    mergeCache(replaceCache(newCache as any), null);

    expect(wire.uids[0].ext.optable.ref).toBe("0");
    expect("_ref" in wire).toBe(false);
  });

  it("collects a stale UID2 from the sidecar after a JSON round-trip", () => {
    const staleRef = ref({ refresh_from: Date.now() - 1 });
    const oldCache = JSON.parse(JSON.stringify(cache([eid("uidapi.com")], { refs: { "uidapi.com": staleRef } })));

    const { merged, staleUid2s } = mergeCache(cache([eid("liveramp.com")]) as any, oldCache);

    expect(staleUid2s).toEqual([{ source: "uidapi.com", ref: staleRef }]);
    expect(getRefData(merged, "uidapi.com")).toEqual(staleRef);
  });

  it("keeps refs when the new response is the cache read back", () => {
    // What a wrapper hands in after sdk.targeting() overwrote the cache key:
    // already cache format, so there are no pointers left to resolve.
    const wireRef = ref({ refresh_from: Date.now() - 1 });
    const readBack = replaceCache(cache([refEid("uidapi.com", "0")], { refs: { "0": wireRef } }) as any);

    const first = mergeCache(readBack, null).merged;
    const { merged, staleUid2s } = mergeCache(cache([eid("liveramp.com")]) as any, first);

    expect(getRefData(merged, "uidapi.com")).toEqual(wireRef);
    expect(staleUid2s).toEqual([{ source: "uidapi.com", ref: wireRef }]);
  });

  it("does not flag fresh UID2 refs or stale non-UID2 sources", () => {
    const oldCache = cache([eid("uidapi.com"), eid("liveramp.com")], {
      refs: { "uidapi.com": ref(), "liveramp.com": ref({ refresh_from: Date.now() - 1 }) },
    });
    const { staleUid2s } = mergeCache(null, oldCache as any);
    expect(staleUid2s).toEqual([]);
  });

  it("a new EID for a source replaces its refs entry, and eviction drops it", () => {
    const oldCache = cache([eid("uidapi.com"), eid("id5-sync.com")], {
      refs: { "uidapi.com": ref({ advertising_token: "old" }), "id5-sync.com": ref() },
    });
    const fresh = ref({ advertising_token: "fresh" });
    // uidapi.com re-resolved with a new ref; id5-sync.com revoked by empty uids.
    const newCache = replaceCache(
      cache([refEid("uidapi.com", "0"), { source: "id5-sync.com", uids: [] }], { refs: { "0": fresh } }) as any
    );

    const { merged } = mergeCache(newCache, oldCache as any);

    expect(getRefData(merged, "uidapi.com")).toEqual(fresh);
    expect(getRefData(merged, "id5-sync.com")).toBeNull();
    expect(merged.ortb2?.user?.eids?.map((e) => e.source)).toEqual(["uidapi.com"]);
  });

  it("a new EID without a ref clears the source's stale refs entry", () => {
    const oldCache = cache([eid("uidapi.com")], { refs: { "uidapi.com": ref() } });
    const { merged } = mergeCache(cache([eid("uidapi.com")]) as any, oldCache as any);
    expect(getRefData(merged, "uidapi.com")).toBeNull();
  });

  it("pairs the refs entry with the EID actually kept when a response duplicates a source", () => {
    const withRef = refEid("uidapi.com", "0");
    const withoutRef = eid("uidapi.com", { uids: [{ id: "kept" }] });
    const newCache = replaceCache(cache([withRef, withoutRef], { refs: { "0": ref() } }) as any);

    const { merged } = mergeCache(newCache, null);

    expect(merged.ortb2?.user?.eids?.[0]?.uids?.[0]?.id).toBe("kept");
    expect(getRefData(merged, "uidapi.com")).toBeNull();
  });

  it("prefers new user data and falls back to old", () => {
    const oldCache = { ortb2: { user: { data: [{ old: true }], eids: [] } } };
    const newCache = { ortb2: { user: { data: [{ fresh: true }], eids: [] } } };
    expect(mergeCache(newCache as any, oldCache as any).merged.ortb2?.user?.data).toEqual([{ fresh: true }]);
    expect(mergeCache({ ortb2: { user: { eids: [] } } } as any, oldCache as any).merged.ortb2?.user?.data).toEqual([
      { old: true },
    ]);
  });

  it("drops a legacy _ref carried on a cached EID", () => {
    const legacy = { ortb2: { user: { eids: [eid("uidapi.com", { _ref: ref() })] } } };

    const { merged } = mergeCache(null, legacy as any);

    expect("_ref" in (merged.ortb2!.user!.eids![0] as any)).toBe(false);
    expect(getRefData(merged, "uidapi.com")).toBeNull();
  });

  it("tolerates null inputs", () => {
    const { merged, staleUid2s } = mergeCache(null, undefined);
    expect(merged.ortb2?.user?.eids).toEqual([]);
    expect(staleUid2s).toEqual([]);
  });
});
