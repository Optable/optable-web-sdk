import type { ResolvedConfig } from "../config";
import { fetch } from "../core/network";

type ContextualSegmentsPayload = {
  url: string;
};

type ContextualCategory = {
  id: string;
  name: string;
  score: number;
  taxonomy: string;
};

type ContextualKeyword = {
  keyword: string;
  // Per-page ordinal rank (1 = most prominent), not a comparable score.
  prominence: number;
};

// Severity a flagged brand-safety category can carry. Ordered by
// RISK_LEVEL_ORDER, where "floor" is the most severe rather than a baseline.
type ContextualRiskTier = "low" | "medium" | "high" | "floor";

// Every value the riskLevel field can hold on the wire. Beyond the tiers:
// "not_assessed" for a category the assessment did not cover, and "" only when
// the DCN failed to resolve a tier it had stored.
type ContextualRiskLevel = ContextualRiskTier | "not_assessed" | "";

// One brand-safety category as classified for the page. Named, not identified:
// the DCN serves no category id on this endpoint.
type ContextualBrandSafetyCategory = {
  name: string;
  riskLevel: ContextualRiskLevel;
};

// Brand-safety classifications, wrapped so the category list is unambiguous.
//
// `assessed` is load-bearing. An empty `categories` is served both for a page
// an assessment found clean and for a page nothing ever assessed, and those are
// opposite answers to a monetization gate. When `assessed` is false there is
// nothing to report and `categories` is empty; when it is true the list holds
// the flags at their tier plus not_assessed for whatever the pass did not
// cover, and an assessed category with no finding is omitted.
//
// A page assessed clean is not a clearance: the taxonomy enumerates risks, so
// the classifier can report a match but never that a page is free of one.
type ContextualBrandSafety = {
  assessed: boolean;
  categories: ContextualBrandSafetyCategory[];
};

type ContextualClassifications = {
  categories: ContextualCategory[];
  keywords: ContextualKeyword[];
  brandSafety: ContextualBrandSafety;
};

type ContextualSegmentsResponse = {
  classifications: ContextualClassifications;
};

async function ContextualSegments(config: ResolvedConfig, url: string): Promise<ContextualSegmentsResponse> {
  const payload: ContextualSegmentsPayload = {
    url: url,
  };

  const response: ContextualSegmentsResponse = await fetch("/v1beta1/contextual", config, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return response;
}

// Severity rank of each tier, ascending. "floor" is the most severe despite
// reading like a baseline: it is the brand-safety floor, below which inventory
// should not monetize. Entries carrying no tier ("not_assessed", or "" on a DCN
// failure) are not severities and are deliberately absent.
const RISK_LEVEL_ORDER: Record<ContextualRiskTier, number> = {
  low: 1,
  medium: 2,
  high: 3,
  floor: 4,
};

// Severity rank of a riskLevel as served, or 0 for anything that is not a tier.
// Own-property lookup, so a category named after an Object prototype member
// cannot be mistaken for a severity.
function riskLevelRank(level: string): number {
  return Object.prototype.hasOwnProperty.call(RISK_LEVEL_ORDER, level)
    ? RISK_LEVEL_ORDER[level as ContextualRiskTier]
    : 0;
}

// Reads the brand-safety classifications off a contextual segments response.
//
// Anything short of an assessment normalizes to { assessed: false,
// categories: [] }: the DCN already answers that way for a page it never
// classified, for a read that failed, and for a node that does not run the
// classifier, so a DCN on a build predating brand-safety serving (which omits
// the field entirely) folds into the same answer rather than a fourth state.
function ContextualBrandSafetyOf(response: ContextualSegmentsResponse | null): ContextualBrandSafety {
  const brandSafety = response?.classifications?.brandSafety;
  if (!brandSafety?.assessed) {
    return { assessed: false, categories: [] };
  }
  return { assessed: true, categories: brandSafety.categories ?? [] };
}

// Most severe tier flagged on the page, or null when nothing is flagged.
//
// Null comes back in two different situations: an assessment ran and flagged
// nothing, and nothing is known about the page at all. A caller that must tell
// those apart reads `assessed` off ContextualBrandSafetyOf as well.
function ContextualMaxRiskLevel(response: ContextualSegmentsResponse | null): ContextualRiskTier | null {
  let maxLevel: ContextualRiskTier | null = null;
  let maxRank = 0;

  for (const category of ContextualBrandSafetyOf(response).categories) {
    const level = category?.riskLevel;
    if (typeof level !== "string") {
      continue;
    }
    const rank = riskLevelRank(level);
    if (rank > maxRank) {
      maxRank = rank;
      maxLevel = level as ContextualRiskTier;
    }
  }

  return maxLevel;
}

// Targeting key-values derived from a contextual segments response, suitable for
// passing to ad servers such as GAM via googletag.pubads().setTargeting(key, values).
type ContextualTargetingKeyValues = Record<string, string[]>;

// Options for including keyword and brand-safety classifications in the
// targeting key-values.
type ContextualTargetingKeyValuesOptions = {
  // GAM key under which keyword classifications are emitted. Defaults to
  // DEFAULT_KEYWORD_KEY when omitted, so keywords are emitted by default. Pass
  // an empty string to opt out of keyword emission entirely.
  keywordKey?: string;
  // Maximum number of keyword values to emit, keeping the most prominent. GAM
  // limits the whole ad request URL to 61,440 characters, so keyword output is
  // bounded rather than dumping every keyword. Defaults to DEFAULT_MAX_KEYWORDS.
  maxKeywords?: number;
  // GAM key under which the page's most severe brand-safety tier is emitted.
  // Defaults to DEFAULT_BRAND_SAFETY_KEY when omitted, so brand safety is
  // emitted by default. Pass an empty string to opt out entirely.
  //
  // Unlike keywords, which are dropped when the DCN produced none, a value is
  // emitted for every state once the key is in play, BRAND_SAFETY_NOT_ASSESSED
  // included. The key is therefore always present unless explicitly disabled.
  brandSafetyKey?: string;
};

// Default GAM key under which keyword values are emitted.
const DEFAULT_KEYWORD_KEY = "ctx_kw";

// Default number of keyword values emitted when maxKeywords is not provided.
const DEFAULT_MAX_KEYWORDS = 10;

// Default GAM key under which the brand-safety tier is emitted.
const DEFAULT_BRAND_SAFETY_KEY = "ctx_bs_max";

// Brand-safety value emitted when no assessment backs the page: it was never
// classified, the read failed, or the DCN does not run the classifier.
//
// Spelled the same as the riskLevel a category carries when an assessment did
// not cover it. One word for one idea, at two scopes: nothing is known here.
// The scopes cannot be confused, since this key only ever holds a page-level
// answer and never a per-category one.
const BRAND_SAFETY_NOT_ASSESSED = "not_assessed";

// Brand-safety value emitted when an assessment ran and flagged no category.
// Not "safe": the taxonomy enumerates risks, so a pass with no finding is not a
// clearance, and a GAM value reading as one would invite it to be treated as
// one.
const BRAND_SAFETY_NO_FLAGS = "no_flags";

// Characters GAM reserves in custom targeting keys and values, stripped from
// keyword values before emitting. See "Valid key-value entry" in the GAM docs:
// https://support.google.com/admanager/answer/10020177
const GAM_RESERVED_CHARS = /["'=!+#*~^()<>[\],;&]/g;

// GAM custom targeting values are capped at 40 characters.
const GAM_MAX_VALUE_LENGTH = 40;

// Normalizes a keyword into a GAM-safe custom targeting value: lowercases (values
// are case-insensitive), strips GAM-reserved characters, collapses whitespace,
// and truncates to the 40-character value limit. Returns "" if nothing usable
// remains, so the caller can drop it.
function sanitizeGamValue(keyword: string): string {
  return keyword
    .toLowerCase()
    .replace(GAM_RESERVED_CHARS, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, GAM_MAX_VALUE_LENGTH)
    .trim();
}

// Builds GAM-style targeting key-values from a contextual segments response by
// grouping category ids under a key derived from each category's taxonomy.
//
// Without taxonomyKeys, the raw taxonomy value is used as the key:
//   { "iab_ct_3_1": ["53", "91", ...] }
//
// With taxonomyKeys, only taxonomies present in the map are emitted, renamed to
// the mapped key (filter + rename):
//   ContextualTargetingKeyValues(resp, { iab_ct_3_1: "foo" }) => { "foo": ["53", ...] }
//
// Keyword classifications are additionally emitted by default under
// DEFAULT_KEYWORD_KEY, sorted by prominence (1 = most prominent), sanitized to
// GAM's value rules, and capped to options.maxKeywords (default
// DEFAULT_MAX_KEYWORDS):
//   ContextualTargetingKeyValues(resp)
//     => { "iab_ct_3_1": ["53", ...], "ctx_kw": ["nba", "playoffs", ...] }
//
// Pass options.keywordKey to emit keywords under a different key, or an empty
// string to opt out of keyword emission entirely:
//   ContextualTargetingKeyValues(resp, undefined, { keywordKey: "" }) // no keywords
function ContextualTargetingKeyValues(
  response: ContextualSegmentsResponse | null,
  taxonomyKeys?: Record<string, string>,
  options?: ContextualTargetingKeyValuesOptions
): ContextualTargetingKeyValues {
  const result: ContextualTargetingKeyValues = {};
  const categories = response?.classifications?.categories ?? [];

  for (const category of categories) {
    const taxonomy = category?.taxonomy;
    if (!taxonomy || category.id == null) {
      continue;
    }

    let key: string;
    if (taxonomyKeys) {
      // Filter: only emit taxonomies the caller explicitly mapped.
      if (!(taxonomy in taxonomyKeys)) {
        continue;
      }
      key = taxonomyKeys[taxonomy];
    } else {
      key = taxonomy;
    }

    if (!(key in result)) {
      result[key] = [];
    }
    // Preserve first-seen order, dedupe within a key.
    if (!result[key].includes(category.id)) {
      result[key].push(category.id);
    }
  }

  // Default the keyword key so keywords are emitted without opting in; an
  // explicit empty string opts out.
  const keywordKey = options?.keywordKey ?? DEFAULT_KEYWORD_KEY;
  if (keywordKey) {
    const maxKeywords = options?.maxKeywords ?? DEFAULT_MAX_KEYWORDS;
    const keywords = response?.classifications?.keywords ?? [];
    // Sort by prominence (1 = most prominent); missing/invalid prominence sorts last.
    const prominenceOf = (k: ContextualKeyword): number =>
      typeof k?.prominence === "number" ? k.prominence : Number.POSITIVE_INFINITY;

    const values: string[] = [];
    const seen = new Set<string>();
    for (const keyword of [...keywords].sort((a, b) => prominenceOf(a) - prominenceOf(b))) {
      if (values.length >= maxKeywords) {
        break;
      }
      if (typeof keyword?.keyword !== "string") {
        continue;
      }
      const value = sanitizeGamValue(keyword.keyword);
      // Drop empties and dedupe (values are case-insensitive to GAM).
      if (value.length === 0 || seen.has(value)) {
        continue;
      }
      seen.add(value);
      values.push(value);
    }

    if (values.length > 0) {
      result[keywordKey] = values;
    }
  }

  // Default the brand-safety key so it is emitted without opting in; an
  // explicit empty string opts out.
  const brandSafetyKey = options?.brandSafetyKey ?? DEFAULT_BRAND_SAFETY_KEY;
  if (brandSafetyKey) {
    result[brandSafetyKey] = [brandSafetyTargetingValue(response)];
  }

  return result;
}

// GAM value for the page's most severe brand-safety tier.
//
// A value is produced for every state rather than the key being dropped when
// nothing is flagged. An absent key would read the same for a page an
// assessment found clean and for a page nothing is known about, so a line item
// could not exclude unassessed inventory without also excluding clean
// inventory. The sentinels keep those separable inside GAM.
function brandSafetyTargetingValue(response: ContextualSegmentsResponse | null): string {
  if (!ContextualBrandSafetyOf(response).assessed) {
    return BRAND_SAFETY_NOT_ASSESSED;
  }
  return ContextualMaxRiskLevel(response) ?? BRAND_SAFETY_NO_FLAGS;
}

export { ContextualSegments, ContextualTargetingKeyValues, ContextualBrandSafetyOf, ContextualMaxRiskLevel };
export default ContextualSegments;
export type {
  ContextualCategory,
  ContextualKeyword,
  ContextualRiskTier,
  ContextualRiskLevel,
  ContextualBrandSafetyCategory,
  ContextualBrandSafety,
  ContextualClassifications,
  ContextualSegmentsResponse,
  ContextualTargetingKeyValuesOptions,
};
