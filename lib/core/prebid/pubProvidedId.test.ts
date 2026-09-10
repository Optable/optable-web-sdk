import { mergeIntoPubProvidedId } from "./pubProvidedId";

type FakePbjs = {
  que: Array<() => void>;
  getConfig: jest.Mock;
  setConfig: jest.Mock;
  refreshUserIds: jest.Mock;
};

function makePbjs(userSync: Record<string, unknown> = {}): FakePbjs {
  return {
    que: [],
    getConfig: jest.fn(() => userSync),
    setConfig: jest.fn(),
    refreshUserIds: jest.fn(),
  };
}

const w = window as unknown as Record<string, any>;

const EIDS = [
  { source: "uidapi.com", uids: [{ atype: 3, id: "uid2-token" }] },
  { source: "id5-sync.com", uids: [{ atype: 1, id: "id5-id" }] },
];

function seedCache(eids: unknown[], key = "OPTABLE_RESOLVED") {
  localStorage.setItem(key, JSON.stringify({ ortb2: { user: { data: [], eids } } }));
}

function drain(pbjs: FakePbjs) {
  pbjs.que.forEach((cmd) => cmd());
}

beforeEach(() => {
  localStorage.clear();
  delete w.pbjs;
  delete w.owpbjs;
});

describe("mergeIntoPubProvidedId", () => {
  it("merges cached EIDs into a single pubProvidedId entry and refreshes it", () => {
    seedCache(EIDS);
    const pbjs = makePbjs({});
    w.pbjs = pbjs;

    mergeIntoPubProvidedId();
    drain(pbjs);

    const config = pbjs.setConfig.mock.calls[0][0];
    expect(config.userSync.userIds).toEqual([{ name: "pubProvidedId", params: { eids: EIDS } }]);
    expect(pbjs.refreshUserIds).toHaveBeenCalledWith({ submoduleNames: ["pubProvidedId"] });
  });

  it("queues onto a stub global when prebid has not loaded yet", () => {
    seedCache(EIDS);
    mergeIntoPubProvidedId();

    expect(w.pbjs.que).toHaveLength(1);
    expect(() => w.pbjs.que.forEach((cmd: () => void) => cmd())).not.toThrow();
  });

  it("preserves other providers' EIDs and replaces ours by source", () => {
    seedCache(EIDS);
    const pbjs = makePbjs({
      userIds: [
        {
          name: "pubProvidedId",
          params: {
            eids: [
              { source: "uidapi.com", uids: [{ id: "old-uid2" }] },
              { source: "publisher.com", uids: [{ id: "pub-own" }] },
            ],
          },
        },
      ],
    });
    w.pbjs = pbjs;

    mergeIntoPubProvidedId();
    drain(pbjs);

    const eids = pbjs.setConfig.mock.calls[0][0].userSync.userIds[0].params.eids;
    expect(eids.map((e: any) => e.source)).toEqual(["publisher.com", "uidapi.com", "id5-sync.com"]);
    expect(eids.find((e: any) => e.source === "uidapi.com").uids[0].id).toBe("uid2-token");
  });

  it("collapses duplicate pubProvidedId entries and keeps other submodules", () => {
    seedCache(EIDS);
    const pbjs = makePbjs({
      syncDelay: 5000,
      userIds: [
        { name: "sharedId" },
        { name: "pubProvidedId", params: { eids: [{ source: "a.com", uids: [{ id: "a" }] }] } },
        { name: "pubProvidedId", params: { eids: [{ source: "b.com", uids: [{ id: "b" }] }] } },
      ],
    });
    w.pbjs = pbjs;

    mergeIntoPubProvidedId();
    drain(pbjs);

    const config = pbjs.setConfig.mock.calls[0][0];
    expect(config.userSync.syncDelay).toBe(5000);
    const names = config.userSync.userIds.map((u: any) => u.name);
    expect(names).toEqual(["sharedId", "pubProvidedId"]);
    const eids = config.userSync.userIds[1].params.eids;
    expect(eids.map((e: any) => e.source)).toEqual(["a.com", "b.com", "uidapi.com", "id5-sync.com"]);
  });

  it("strips underscore-prefixed cache sidecars before handing EIDs to prebid", () => {
    seedCache([{ source: "uidapi.com", uids: [{ id: "x" }], _ref: { refresh_token: "rt" }, _id5: { t: 1 } }]);
    const pbjs = makePbjs({});
    w.pbjs = pbjs;

    mergeIntoPubProvidedId();
    drain(pbjs);

    const eid = pbjs.setConfig.mock.calls[0][0].userSync.userIds[0].params.eids[0];
    expect(eid).toEqual({ source: "uidapi.com", uids: [{ id: "x" }] });
  });

  it("does nothing when the cache has no EIDs", () => {
    const pbjs = makePbjs({});
    w.pbjs = pbjs;

    mergeIntoPubProvidedId();

    expect(pbjs.que).toHaveLength(0);
  });

  it("merges into every configured instance", () => {
    seedCache(EIDS);
    const a = makePbjs({});
    const b = makePbjs({});
    w.pbjs = a;
    w.owpbjs = b;

    mergeIntoPubProvidedId({ instances: ["pbjs", "owpbjs"] });
    drain(a);
    drain(b);

    expect(a.setConfig).toHaveBeenCalled();
    expect(b.setConfig).toHaveBeenCalled();
  });

  it("accepts explicit eids and a custom cacheKey", () => {
    seedCache(EIDS, "MY_CACHE");
    const pbjs = makePbjs({});
    w.pbjs = pbjs;

    mergeIntoPubProvidedId({ cacheKey: "MY_CACHE" });
    drain(pbjs);
    expect(pbjs.setConfig.mock.calls[0][0].userSync.userIds[0].params.eids).toEqual(EIDS);

    const direct = makePbjs({});
    w.pbjs = direct;
    mergeIntoPubProvidedId({ eids: [{ source: "direct.com", uids: [{ id: "d" }] }] });
    drain(direct);
    expect(direct.setConfig.mock.calls[0][0].userSync.userIds[0].params.eids).toEqual([
      { source: "direct.com", uids: [{ id: "d" }] },
    ]);
  });

  it("refreshAll refreshes every user-id submodule instead of only pubProvidedId", () => {
    seedCache(EIDS);
    const pbjs = makePbjs({});
    w.pbjs = pbjs;

    mergeIntoPubProvidedId({ refreshAll: true });
    drain(pbjs);

    expect(pbjs.refreshUserIds).toHaveBeenCalledWith();
  });

  it("a throwing prebid config call does not break the queue", () => {
    seedCache(EIDS);
    const pbjs = makePbjs({});
    pbjs.getConfig.mockImplementation(() => {
      throw new Error("boom");
    });
    w.pbjs = pbjs;

    mergeIntoPubProvidedId();
    expect(() => drain(pbjs)).not.toThrow();
    expect(pbjs.setConfig).not.toHaveBeenCalled();
  });
});
