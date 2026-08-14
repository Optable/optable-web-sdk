import { ContextualTargetingKeyValues } from "./contextual_segments";
import type { ContextualSegmentsResponse } from "./contextual_segments";

// Helper to build a response with the given categories/keywords. Accepts a
// partial so tests can model responses where the DCN omitted a key entirely.
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

  test("emits keywords by default under ctx_kw, sorted by prominence (1 = most prominent first)", () => {
    expect(ContextualTargetingKeyValues(withKeywords)).toEqual({
      iab_ct_3_1: ["53"],
      ctx_kw: ["earnings", "startup", "entrepreneur"],
    });
    // Renaming taxonomy keys does not affect the default keyword key.
    expect(ContextualTargetingKeyValues(withKeywords, { iab_ct_3_1: "ctx_iab" })).toEqual({
      ctx_iab: ["53"],
      ctx_kw: ["earnings", "startup", "entrepreneur"],
    });
  });

  test("emits keywords under a caller-provided key when keywordKey is set", () => {
    expect(ContextualTargetingKeyValues(withKeywords, undefined, { keywordKey: "kw" })).toEqual({
      iab_ct_3_1: ["53"],
      kw: ["earnings", "startup", "entrepreneur"],
    });
  });

  test("opts out of keyword emission when keywordKey is an empty string", () => {
    expect(ContextualTargetingKeyValues(withKeywords, { iab_ct_3_1: "ctx_iab" }, { keywordKey: "" })).toEqual({
      ctx_iab: ["53"],
    });
  });

  test("caps to maxKeywords by prominence", () => {
    expect(ContextualTargetingKeyValues(withKeywords, undefined, { keywordKey: "ctx_kw", maxKeywords: 2 })).toEqual({
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
    expect(ContextualTargetingKeyValues(response({ categories: [] }), undefined, { keywordKey: "ctx_kw" })).toEqual({});
    expect(
      ContextualTargetingKeyValues(response({ categories: [], keywords: [] }), undefined, { keywordKey: "ctx_kw" })
    ).toEqual({});
    expect(
      ContextualTargetingKeyValues(
        response({ categories: [], keywords: [{ keyword: "***", prominence: 1 }] }),
        undefined,
        {
          keywordKey: "ctx_kw",
        }
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
