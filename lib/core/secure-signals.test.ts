import { secureSignalsFromEids } from "./secure-signals";

const EIDS = [
  { source: "uidapi.com", matcher: "m1", inserter: "optable", uids: [{ id: "uid2-a" }, { id: "uid2-b" }] },
  { source: "id5-sync.com", matcher: "m2", uids: [{ id: "id5-a" }] },
  { source: "liveramp.com", uids: [] },
];

describe("secureSignalsFromEids", () => {
  it("emits one signal per source, taking the first non-empty uid", () => {
    expect(secureSignalsFromEids(EIDS)).toEqual([
      { provider: "uidapi.com", id: "uid2-a" },
      { provider: "id5-sync.com", id: "id5-a" },
    ]);
  });

  it("keeps the first EID when a source appears twice", () => {
    const dup = [
      { source: "pair.optable.co", uids: [{ id: "pair-1" }] },
      { source: "pair.optable.co", uids: [{ id: "pair-2" }] },
    ];
    expect(secureSignalsFromEids(dup)).toEqual([{ provider: "pair.optable.co", id: "pair-1" }]);
  });

  it("filters by source, inserter and matcher", () => {
    expect(secureSignalsFromEids(EIDS, { sources: ["id5-sync.com"] })).toEqual([
      { provider: "id5-sync.com", id: "id5-a" },
    ]);
    expect(secureSignalsFromEids(EIDS, { inserters: ["optable"] }).map((s) => s.provider)).toEqual(["uidapi.com"]);
    expect(secureSignalsFromEids(EIDS, { matchers: ["m2"] })).toEqual([{ provider: "id5-sync.com", id: "id5-a" }]);
  });

  it("treats an empty filter list as no constraint", () => {
    expect(secureSignalsFromEids(EIDS, { sources: [] })).toHaveLength(2);
  });

  it("skips uids without an id and tolerates empty input", () => {
    expect(secureSignalsFromEids([{ source: "a.com", uids: [{ id: "" }, {}] }])).toEqual([]);
    expect(secureSignalsFromEids([{ source: "a.com", uids: [{ id: "" }, { id: "real" }] }])).toEqual([
      { provider: "a.com", id: "real" },
    ]);
    expect(secureSignalsFromEids([])).toEqual([]);
  });
});
