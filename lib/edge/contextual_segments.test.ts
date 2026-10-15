import { ContextualBrandSafetyOf, ContextualMaxRiskLevel, ContextualTargetingKeyValues } from "./contextual_segments";
import type {
  ContextualBrandSafety,
  ContextualBrandSafetyCategory,
  ContextualSegmentsResponse,
} from "./contextual_segments";

// Helper to build a response with the given classifications. Accepts a partial
// so tests can model responses where the DCN omitted a key entirely.
function response(classifications: Partial<ContextualSegmentsResponse["classifications"]>): ContextualSegmentsResponse {
  return { classifications: classifications as ContextualSegmentsResponse["classifications"] };
}

describe("ContextualTargetingKeyValues keyword emission", () => {
  const withKeywords = response({
    categories: [{ id: "53", name: "Business", score: 0.9, taxonomy: "iab_ct_3_1" }],
    keywords: [
      { keyword: "startup", prominence: 2 },
      { keyword: "earnings", prominence: 1 },
      { keyword: "entrepreneur", prominence: 3 },
    ],
  });

  // Also pins the whole default shape: keywords and brand safety are both
  // emitted without opting in, so this fixture (which carries no brandSafety)
  // reports it as unknown.
  test("emits keywords by default under ctx_kw, sorted by prominence (1 = most prominent first)", () => {
    expect(ContextualTargetingKeyValues(withKeywords)).toEqual({
      iab_ct_3_1: ["53"],
      ctx_kw: ["earnings", "startup", "entrepreneur"],
      ctx_bs_max: ["not_assessed"],
    });
    // Renaming taxonomy keys does not affect the default keyword key.
    expect(ContextualTargetingKeyValues(withKeywords, { iab_ct_3_1: "ctx_iab" })).toEqual({
      ctx_iab: ["53"],
      ctx_kw: ["earnings", "startup", "entrepreneur"],
      ctx_bs_max: ["not_assessed"],
    });
  });

  test("emits keywords under a caller-provided key when keywordKey is set", () => {
    expect(ContextualTargetingKeyValues(withKeywords, undefined, { keywordKey: "kw", brandSafetyKey: "" })).toEqual({
      iab_ct_3_1: ["53"],
      kw: ["earnings", "startup", "entrepreneur"],
    });
  });

  test("opts out of keyword emission when keywordKey is an empty string", () => {
    expect(
      ContextualTargetingKeyValues(withKeywords, { iab_ct_3_1: "ctx_iab" }, { keywordKey: "", brandSafetyKey: "" })
    ).toEqual({
      ctx_iab: ["53"],
    });
  });

  test("caps to maxKeywords by prominence", () => {
    expect(
      ContextualTargetingKeyValues(withKeywords, undefined, {
        keywordKey: "ctx_kw",
        maxKeywords: 2,
        brandSafetyKey: "",
      })
    ).toEqual({
      iab_ct_3_1: ["53"],
      ctx_kw: ["earnings", "startup"],
    });
  });

  test("defaults to the top 10 keywords when maxKeywords is not given", () => {
    const many = response({
      categories: [],
      keywords: Array.from({ length: 15 }, (_, i) => ({ keyword: `kw${i}`, prominence: i + 1 })),
    });
    const result = ContextualTargetingKeyValues(many, undefined, { keywordKey: "ctx_kw" });
    expect(result.ctx_kw).toHaveLength(10);
    expect(result.ctx_kw).toEqual(["kw0", "kw1", "kw2", "kw3", "kw4", "kw5", "kw6", "kw7", "kw8", "kw9"]);
  });

  test("sanitizes values to GAM rules: lowercases, strips disallowed chars, truncates to 40, drops empties", () => {
    const dirty = response({
      categories: [],
      keywords: [
        { keyword: "Q3 Earnings", prominence: 1 }, // uppercase + space (space allowed)
        { keyword: "R&D,budgets", prominence: 2 }, // & and , are disallowed
        { keyword: "!!!", prominence: 3 }, // becomes empty -> dropped
        { keyword: "a".repeat(50), prominence: 4 }, // too long -> truncated to 40
      ],
    });
    const result = ContextualTargetingKeyValues(dirty, undefined, { keywordKey: "ctx_kw" });
    expect(result.ctx_kw).toEqual(["q3 earnings", "rdbudgets", "a".repeat(40)]);
  });

  test("dedupes case-insensitively, preserving prominence order", () => {
    const dupes = response({
      categories: [],
      keywords: [
        { keyword: "B2B", prominence: 1 },
        { keyword: "b2b", prominence: 2 },
        { keyword: "pricing", prominence: 3 },
      ],
    });
    expect(ContextualTargetingKeyValues(dupes, undefined, { keywordKey: "ctx_kw" }).ctx_kw).toEqual(["b2b", "pricing"]);
  });

  test("omits the keyword key entirely when there are no usable keywords", () => {
    const opts = { keywordKey: "ctx_kw", brandSafetyKey: "" };
    expect(ContextualTargetingKeyValues(response({ categories: [] }), undefined, opts)).toEqual({});
    expect(ContextualTargetingKeyValues(response({ categories: [], keywords: [] }), undefined, opts)).toEqual({});
    expect(
      ContextualTargetingKeyValues(
        response({ categories: [], keywords: [{ keyword: "***", prominence: 1 }] }),
        undefined,
        opts
      )
    ).toEqual({});
  });

  test("orders keywords with missing/invalid prominence last", () => {
    const mixed = response({
      categories: [],
      keywords: [
        { keyword: "second", prominence: 5 },
        { keyword: "last", prominence: undefined as unknown as number },
        { keyword: "first", prominence: 1 },
      ],
    });
    expect(ContextualTargetingKeyValues(mixed, undefined, { keywordKey: "ctx_kw" }).ctx_kw).toEqual([
      "first",
      "second",
      "last",
    ]);
  });
});

describe("ContextualBrandSafetyOf", () => {
  test("returns the group as served when an assessment backs it", () => {
    const flagged = response({
      categories: [],
      brandSafety: {
        assessed: true,
        categories: [
          { name: "Terrorism", riskLevel: "floor" },
          { name: "Misinformation", riskLevel: "not_assessed" },
        ],
      },
    });
    expect(ContextualBrandSafetyOf(flagged)).toEqual({
      assessed: true,
      categories: [
        { name: "Terrorism", riskLevel: "floor" },
        { name: "Misinformation", riskLevel: "not_assessed" },
      ],
    });
  });

  test("distinguishes assessed-and-clean from nothing-is-known", () => {
    const clean = response({ categories: [], brandSafety: { assessed: true, categories: [] } });
    const unknown = response({ categories: [], brandSafety: { assessed: false, categories: [] } });

    expect(ContextualBrandSafetyOf(clean).assessed).toBe(true);
    expect(ContextualBrandSafetyOf(unknown).assessed).toBe(false);
  });

  // A DCN on an edge build that predates brand-safety serving omits the field.
  // That is the same answer the endpoint already gives for a node not running
  // the classifier, so it folds into assessed false rather than a fourth state.
  test("folds a missing or null response into nothing-is-known", () => {
    expect(ContextualBrandSafetyOf(response({ categories: [] }))).toEqual({ assessed: false, categories: [] });
    expect(ContextualBrandSafetyOf(null)).toEqual({ assessed: false, categories: [] });
  });

  test("never reports categories alongside assessed false", () => {
    const inconsistent = response({
      categories: [],
      brandSafety: { assessed: false, categories: [{ name: "Terrorism", riskLevel: "floor" }] },
    });
    expect(ContextualBrandSafetyOf(inconsistent)).toEqual({ assessed: false, categories: [] });
  });
});

describe("ContextualMaxRiskLevel", () => {
  function brandSafety(categories: ContextualBrandSafetyCategory[]): ContextualSegmentsResponse {
    return response({ categories: [], brandSafety: { assessed: true, categories } });
  }

  test("returns the most severe tier flagged, with floor above high", () => {
    expect(
      ContextualMaxRiskLevel(
        brandSafety([
          { name: "Debated Sensitive Social Issue", riskLevel: "low" },
          { name: "Terrorism", riskLevel: "floor" },
          { name: "Arms & Ammunition", riskLevel: "high" },
        ])
      )
    ).toBe("floor");
    expect(
      ContextualMaxRiskLevel(
        brandSafety([
          { name: "Online piracy", riskLevel: "low" },
          { name: "Misinformation", riskLevel: "medium" },
        ])
      )
    ).toBe("medium");
  });

  // not_assessed is the entry's own state, not a tier, so it can never be the
  // maximum. "" is only served on a DCN defect and is treated the same way.
  test("ignores entries that carry no tier", () => {
    expect(
      ContextualMaxRiskLevel(
        brandSafety([
          { name: "Terrorism", riskLevel: "not_assessed" },
          { name: "Misinformation", riskLevel: "" },
          { name: "Online piracy", riskLevel: "low" },
        ])
      )
    ).toBe("low");
    expect(ContextualMaxRiskLevel(brandSafety([{ name: "Terrorism", riskLevel: "not_assessed" }]))).toBeNull();
  });

  // Null for both, deliberately: a caller that must tell "assessed, no flags"
  // from "nothing is known" reads assessed, not the maximum.
  test("returns null when nothing is flagged", () => {
    expect(ContextualMaxRiskLevel(brandSafety([]))).toBeNull();
    expect(ContextualMaxRiskLevel(response({ categories: [] }))).toBeNull();
    expect(ContextualMaxRiskLevel(null)).toBeNull();
  });
});

describe("ContextualTargetingKeyValues brand-safety emission", () => {
  function brandSafety(group: ContextualBrandSafety | undefined): ContextualSegmentsResponse {
    return response({
      categories: [{ id: "53", name: "Business", score: 0.9, taxonomy: "iab_ct_3_1" }],
      keywords: [],
      brandSafety: group,
    });
  }

  test("is emitted by default under ctx_bs_max, and opts out on an empty key", () => {
    const flagged = brandSafety({ assessed: true, categories: [{ name: "Terrorism", riskLevel: "floor" }] });

    expect(ContextualTargetingKeyValues(flagged)).toEqual({ iab_ct_3_1: ["53"], ctx_bs_max: ["floor"] });
    expect(ContextualTargetingKeyValues(flagged, undefined, { brandSafetyKey: "" })).toEqual({ iab_ct_3_1: ["53"] });
  });

  test("emits the most severe tier flagged, alongside the other keys", () => {
    const flagged = brandSafety({
      assessed: true,
      categories: [
        { name: "Death, Injury or Military Conflict", riskLevel: "low" },
        { name: "Terrorism", riskLevel: "floor" },
        { name: "Misinformation", riskLevel: "not_assessed" },
      ],
    });

    expect(ContextualTargetingKeyValues(flagged, undefined, { brandSafetyKey: "ctx_bs_max" })).toEqual({
      iab_ct_3_1: ["53"],
      ctx_bs_max: ["floor"],
    });
  });

  test("emits no_flags when an assessment ran and flagged nothing", () => {
    const clean = brandSafety({ assessed: true, categories: [] });
    const uncovered = brandSafety({
      assessed: true,
      categories: [{ name: "Terrorism", riskLevel: "not_assessed" }],
    });

    expect(ContextualTargetingKeyValues(clean, undefined, { brandSafetyKey: "ctx_bs_max" }).ctx_bs_max).toEqual([
      "no_flags",
    ]);
    expect(ContextualTargetingKeyValues(uncovered, undefined, { brandSafetyKey: "ctx_bs_max" }).ctx_bs_max).toEqual([
      "no_flags",
    ]);
  });

  // The whole point of emitting a sentinel rather than omitting the key: a line
  // item can tell "we never looked" from "we looked and flagged nothing".
  test("emits not_assessed when nothing is known about the page", () => {
    const unassessed = brandSafety({ assessed: false, categories: [] });
    const notServed = brandSafety(undefined);

    expect(ContextualTargetingKeyValues(unassessed, undefined, { brandSafetyKey: "ctx_bs_max" }).ctx_bs_max).toEqual([
      "not_assessed",
    ]);
    expect(ContextualTargetingKeyValues(notServed, undefined, { brandSafetyKey: "ctx_bs_max" }).ctx_bs_max).toEqual([
      "not_assessed",
    ]);
    expect(ContextualTargetingKeyValues(null, undefined, { brandSafetyKey: "ctx_bs_max" })).toEqual({
      ctx_bs_max: ["not_assessed"],
    });
  });

  test("emits under a caller-provided key and composes with the other options", () => {
    const flagged = response({
      categories: [{ id: "53", name: "Business", score: 0.9, taxonomy: "iab_ct_3_1" }],
      keywords: [{ keyword: "earnings", prominence: 1 }],
      brandSafety: { assessed: true, categories: [{ name: "Online piracy", riskLevel: "medium" }] },
    });

    expect(
      ContextualTargetingKeyValues(flagged, { iab_ct_3_1: "ctx_iab" }, { keywordKey: "", brandSafetyKey: "bs" })
    ).toEqual({ ctx_iab: ["53"], bs: ["medium"] });
  });
});
