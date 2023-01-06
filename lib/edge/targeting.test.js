import { PrebidORTB2, TargetingKeyValues } from "./targeting";

describe("PrebidORTB2", () => {
  test("returns empty array on empty input", () => {
    const empty = { user: { data: [], ext: { eids: []} }}
    expect(PrebidORTB2(null)).toEqual(empty)
    expect(PrebidORTB2({})).toEqual(empty)
  })

  test("returns for each targeting audiences a user segments compatible with ortb2.user.data", () => {
    const targeting = {
      audience: [
        { ids: [{ id: "a"}, {id: "b"}, {id: "c"}], provider: "optable.co", rtb_segtax: 123 }
      ],
      user: [
        { provider: "uidapi.com", ids: [{id: "d"}] }
      ]
    };

    expect(PrebidORTB2(targeting)).toEqual(
      {
        user: {
          data: [{name: "optable.co", segment: [{ id: "a"}, {id: "b"}, {id: "c"}], ext: {segtax: 123}}],
          ext: { eids: [{ source: "uidapi.com", uids: [{id: "d", atype: 3}]}] },
        },
      }
    )
  })
})

describe("TargetingKeyValues", () => {
  test("returns empty object on empty input", () => {
    expect(TargetingKeyValues(null)).toEqual({})
    expect(TargetingKeyValues({})).toEqual({})
  })

  test("returns key values based on keyspace presence", () => {
    const targeting = {
      audience: [
        { ids: [{ id: "a"}, {id: "b"}, {id: "c"}], provider: "optable.co", keyspace: "k1" },
        { ids: [{ id: "d"}, {id: "e"}, {id: "f"}], provider: "optable.co", keyspace: "k1" },
        { ids: [{ id: "g"}, {id: "h"}, {id: "i"}], provider: "optable.co", keyspace: "k2" },
        { ids: [{ id: "j"}, {id: "k"}, {id: "l"}], provider: "optable.co" },
      ],
      user: [
        {provider: "uidapi.com", ids: [{id: "d"}]},
      ],
    };
    expect(TargetingKeyValues(targeting)).toEqual({
      "k1": ["a", "b", "c", "d", "e", "f"],
      "k2": ["g", "h", "i"],
    })
  })
})
