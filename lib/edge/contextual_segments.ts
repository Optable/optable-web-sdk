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

type ContextualClassifications = {
  categories: ContextualCategory[];
  keywords: ContextualKeyword[];
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

// Targeting key-values derived from a contextual segments response, suitable for
// passing to ad servers such as GAM via googletag.pubads().setTargeting(key, values).
type ContextualTargetingKeyValues = Record<string, string[]>;

// Options for including keyword classifications in the targeting key-values.
type ContextualTargetingKeyValuesOptions = {
  // GAM key under which keyword classifications are emitted. Defaults to
  // DEFAULT_KEYWORD_KEY when omitted, so keywords are emitted by default. Pass
  // an empty string to opt out of keyword emission entirely.
  keywordKey?: string;
  // Maximum number of keyword values to emit, keeping the most prominent. GAM
  // limits the whole ad request URL to 61,440 characters, so keyword output is
  // bounded rather than dumping every keyword. Defaults to DEFAULT_MAX_KEYWORDS.
  maxKeywords?: number;
};

// Default GAM key under which keyword values are emitted.
const DEFAULT_KEYWORD_KEY = "ctx_kw";

// Default number of keyword values emitted when maxKeywords is not provided.
const DEFAULT_MAX_KEYWORDS = 10;

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

  return result;
}

export { ContextualSegments, ContextualTargetingKeyValues };
export default ContextualSegments;
export type {
  ContextualCategory,
  ContextualKeyword,
  ContextualClassifications,
  ContextualSegmentsResponse,
  ContextualTargetingKeyValuesOptions,
};
