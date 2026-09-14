import { secureSignalsFromEids } from "./secure-signals";

const EIDS = [
  { source: "uidapi.com", matcher: "m1", inserter: "optable", uids: [{ id: "uid2-a" }, { id: "uid2-b" }] },
  { source: "id5-sync.com", matcher: "m2", uids: [{ id: "id5-a" }] },
  { source: "liveramp.com", uids: [] },
];

describe("secureSignalsFromEids", () => {
  it("flattens every uid into a provider/id pair", () => {
    expect(secureSignalsFromEids(EIDS)).toEqual([
      { provider: "uidapi.com", id: "uid2-a" },
      { provider: "uidapi.com", id: "uid2-b" },
      { provider: "id5-sync.com", id: "id5-a" },
    ]);
  });

  it("filters by source, inserter and matcher", () => {
    expect(secureSignalsFromEids(EIDS, { sources: ["id5-sync.com"] })).toEqual([
      { provider: "id5-sync.com", id: "id5-a" },
    ]);
    expect(secureSignalsFromEids(EIDS, { inserters: ["optable"] }).map((s) => s.provider)).toEqual([
      "uidapi.com",
      "uidapi.com",
    ]);
    expect(secureSignalsFromEids(EIDS, { matchers: ["m2"] })).toEqual([{ provider: "id5-sync.com", id: "id5-a" }]);
  });

  it("treats an empty filter list as no constraint", () => {
    expect(secureSignalsFromEids(EIDS, { sources: [] })).toHaveLength(3);
  });

  it("skips uids without an id and tolerates empty input", () => {
    expect(secureSignalsFromEids([{ source: "a.com", uids: [{ id: "" }, {}] }])).toEqual([]);
    expect(secureSignalsFromEids([])).toEqual([]);
  });
});
