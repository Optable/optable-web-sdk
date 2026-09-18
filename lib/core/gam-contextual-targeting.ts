import type { ContextualTargetingKeyValuesOptions } from "../edge/contextual_segments";
import type OptableSDK from "../sdk";

// Fetches the page's contextual segments and pushes the resulting key-values
// to GAM via googletag.pubads().setTargeting. taxonomyKeys and options are
// forwarded to ctxTargetingKeyValues(); url to ctxSegments(), for SPAs
// classifying a route other than the current location.
export async function setContextualTargetingInGAM(
  sdk: OptableSDK,
  taxonomyKeys?: Record<string, string>,
  options?: ContextualTargetingKeyValuesOptions,
  url?: string
): Promise<void> {
  await sdk.ctxSegments(url);
  const kvs = sdk.ctxTargetingKeyValues(taxonomyKeys, options);
  if (!Object.keys(kvs).length) return;

  window.googletag = window.googletag || { cmd: [] };
  window.googletag.cmd.push(() => {
    for (const [key, values] of Object.entries(kvs)) {
      window.googletag.pubads().setTargeting(key, values);
    }
  });
}
