import type { ContextualTargetingKeyValuesOptions } from "../edge/contextual_segments";
import { debugLog } from "./log";
import type OptableSDK from "../sdk";

// Fetches the page's contextual segments and pushes the resulting key-values
// to GAM via googletag.pubads().setTargeting. taxonomyKeys and options are
// forwarded to ctxTargetingKeyValues(); url to ctxSegments(), for SPAs
// classifying a route other than the current location.
//
// Never rejects: callers fire this without awaiting, and page targeting must
// not break ad loading.
export async function setContextualTargetingInGAM(
  sdk: OptableSDK,
  taxonomyKeys?: Record<string, string>,
  options?: ContextualTargetingKeyValuesOptions,
  url?: string
): Promise<void> {
  let kvs: Record<string, string[]>;
  try {
    await sdk.ctxSegments(url);
    kvs = sdk.ctxTargetingKeyValues(taxonomyKeys, options);
  } catch (err) {
    debugLog("warn", "Contextual: segments unavailable", err);
    return;
  }
  if (!Object.keys(kvs).length) return;

  // A partial stub can define googletag without cmd, so build both up rather
  // than only substituting a missing googletag wholesale.
  const gpt = (window.googletag = window.googletag || ({} as typeof window.googletag)) as typeof window.googletag & {
    cmd: Array<() => void>;
  };
  gpt.cmd = gpt.cmd || [];
  gpt.cmd.push(() => {
    const pubads = gpt.pubads && gpt.pubads();
    if (!pubads || typeof pubads.setTargeting !== "function") return;
    for (const [key, values] of Object.entries(kvs)) {
      pubads.setTargeting(key, values);
    }
  });
}
