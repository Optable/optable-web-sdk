import { getRefData, isUid2Stale, mergeCache, resolveRefs } from "./eid-cache";

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

const cache = (eids: unknown[], over: Record<string, unknown> = {}) => ({
  ortb2: { user: { data: [], eids } },
  ...over,
});

describe("resolveRefs", () => {
  it("stamps ref data onto EIDs that reference the refs map", () => {
    const uid2 = { source: "uidapi.com", uids: [{ id: "x", ext: { optable: { ref: "0" } } }] };
    const other = eid("liveramp.com");
    const refs = { "0": ref() };
    resolveRefs([uid2, other] as any, refs as any);
    expect((uid2 as any)._ref).toBe(refs["0"]);
    expect((other as any)._ref).toBeUndefined();
  });

  it("is a no-op without a refs map", () => {
    const e = eid("uidapi.com");
    expect(() => resolveRefs([e] as any)).not.toThrow();
    expect((e as any)._ref).toBeUndefined();
  });
});

describe("getRefData", () => {
  it("returns the ref only when it can drive a refresh", () => {
    expect(getRefData(eid("uidapi.com", { _ref: ref() }) as any)).not.toBeNull();
    expect(getRefData(eid("uidapi.com", { _ref: ref({ refresh_token: "" }) }) as any)).toBeNull();
    expect(getRefData(eid("uidapi.com") as any)).toBeNull();
  });
});

describe("isUid2Stale", () => {
  it("is true past refresh_from and false before", () => {
    expect(isUid2Stale(eid("uidapi.com", { _ref: ref({ refresh_from: Date.now() - 1 }) }) as any)).toBe(true);
    expect(isUid2Stale(eid("uidapi.com", { _ref: ref() }) as any)).toBe(false);
    expect(isUid2Stale(eid("uidapi.com") as any)).toBe(false);
  });

  it("treats a ref without refresh_from as stale", () => {
    expect(isUid2Stale(eid("uidapi.com", { _ref: ref({ refresh_from: undefined }) }) as any)).toBe(true);
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
    const again = eid("a", { uids: [{ id: "1" }, { id: "2" }, { id: "3" }] });
    expect(
      mergeCache(cache([again]) as any, null, { maxUidsPerEid: 1 }).merged.ortb2?.user?.eids?.[0]?.uids
    ).toHaveLength(1);
  });

  it("resolves refs from the new response and collects stale UID2 EIDs", () => {
    const uid2 = { source: "uidapi.com", uids: [{ id: "x", ext: { optable: { ref: "0" } } }] };
    const newCache = cache([uid2], { refs: { "0": ref({ refresh_from: Date.now() - 1 }) } });
    const { merged, staleUid2s } = mergeCache(newCache as any, null);
    expect(staleUid2s).toHaveLength(1);
    expect(staleUid2s[0].source).toBe("uidapi.com");
    expect(merged.ortb2?.user?.eids).toHaveLength(1);
  });

  it("does not flag fresh UID2 EIDs or stale non-UID2 sources", () => {
    const freshUid2 = eid("uidapi.com", { _ref: ref() });
    const staleOther = eid("liveramp.com", { _ref: ref({ refresh_from: Date.now() - 1 }) });
    const { staleUid2s } = mergeCache(cache([freshUid2, staleOther]) as any, null);
    expect(staleUid2s).toEqual([]);
  });

  it("prefers new user data and falls back to old", () => {
    const oldCache = { ortb2: { user: { data: [{ old: true }], eids: [] } } };
    const newCache = { ortb2: { user: { data: [{ fresh: true }], eids: [] } } };
    expect(mergeCache(newCache as any, oldCache as any).merged.ortb2?.user?.data).toEqual([{ fresh: true }]);
    expect(mergeCache({ ortb2: { user: { eids: [] } } } as any, oldCache as any).merged.ortb2?.user?.data).toEqual([
      { old: true },
    ]);
  });

  it("tolerates null inputs", () => {
    const { merged, staleUid2s } = mergeCache(null, undefined);
    expect(merged.ortb2?.user?.eids).toEqual([]);
    expect(staleUid2s).toEqual([]);
  });

  it("does not mutate the caller's response", () => {
    const uid2 = {
      source: "uidapi.com",
      uids: [{ id: "1", ext: { optable: { ref: "0" } } }, { id: "2" }, { id: "3" }],
    };
    const newCache = cache([uid2], { refs: { "0": ref() } });

    const { merged } = mergeCache(newCache as any, null);

    expect(uid2.uids).toHaveLength(3);
    expect("_ref" in uid2).toBe(false);
    const mergedEid = merged.ortb2?.user?.eids?.[0];
    expect(mergedEid?.uids).toHaveLength(2);
    expect(mergedEid?._ref).toBeDefined();
  });

  it("collects a stale UID2 carried over from the old cache after a JSON round-trip", () => {
    const oldCache = JSON.parse(
      JSON.stringify(cache([eid("uidapi.com", { _ref: ref({ refresh_from: Date.now() - 1 }) })]))
    );

    const { merged, staleUid2s } = mergeCache(cache([eid("liveramp.com")]) as any, oldCache);

    expect(staleUid2s).toHaveLength(1);
    expect(staleUid2s[0]._ref?.refresh_token).toBe("rt");
    expect(merged.ortb2?.user?.eids?.map((e) => e.source).sort()).toEqual(["liveramp.com", "uidapi.com"]);
  });

  it("a new EID without uids evicts the cached EID for that source", () => {
    const oldCache = cache([eid("uidapi.com"), eid("liveramp.com")]);
    const newCache = cache([{ source: "uidapi.com", uids: [] }]);

    const { merged } = mergeCache(newCache as any, oldCache as any);

    expect(merged.ortb2?.user?.eids?.map((e) => e.source)).toEqual(["liveramp.com"]);
  });

  it("ignores malformed and inherited-key refs", () => {
    const badShape = { source: "uidapi.com", uids: [{ id: "x", ext: { optable: { ref: "0" } } }] };
    const inherited = { source: "id5-sync.com", uids: [{ id: "y", ext: { optable: { ref: "constructor" } } }] };
    const newCache = cache([badShape, inherited], { refs: { "0": { refresh_token: "rt" } } });

    const { merged, staleUid2s } = mergeCache(newCache as any, null);

    expect(staleUid2s).toEqual([]);
    merged.ortb2?.user?.eids?.forEach((e) => expect(e._ref).toBeUndefined());
  });
});
