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

type ContextualClassifications = {
  categories: ContextualCategory[];
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

// Builds GAM-style targeting key-values from a contextual segments response by
// grouping category ids under a key derived from each category's taxonomy.
//
// Without taxonomyKeys, the raw taxonomy value is used as the key:
//   { "iab_ct_3_1": ["53", "91", ...] }
//
// With taxonomyKeys, only taxonomies present in the map are emitted, renamed to
// the mapped key (filter + rename):
//   ContextualTargetingKeyValues(resp, { iab_ct_3_1: "foo" }) => { "foo": ["53", ...] }
function ContextualTargetingKeyValues(
  response: ContextualSegmentsResponse | null,
  taxonomyKeys?: Record<string, string>
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

  return result;
}

export { ContextualSegments, ContextualTargetingKeyValues };
export default ContextualSegments;
export type { ContextualCategory, ContextualClassifications, ContextualSegmentsResponse };
