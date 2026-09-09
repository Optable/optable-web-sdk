import { debugLog } from "../core/log";

const SOURCE_EXISTS_KEY = "optable_source_exists";
const DEFAULT_CHECK_HOST = "na.edge.optable.co";

type SourceCheckOptions = {
  // Site slug configured on the page, to be verified against the DCN.
  site: string;
  // Source to fall back to when `site` has no matching source.
  defaultSite: string;
  // DCN node the wrapper targets.
  node?: string;
  // Edge host to probe.
  host?: string;
};

/**
 * Verifies that `site` has a matching source configured in the DCN and
 * returns the site to use: `site` when it exists, `defaultSite` when it does
 * not. The result is cached in sessionStorage, so the probe runs at most once
 * per session. Only a network-level failure (the edge rejecting the unknown
 * origin) marks a source missing.
 */
async function checkSourceExists({ site, defaultSite, node, host }: SourceCheckOptions): Promise<string> {
  const fallback = defaultSite || "default-sdk";

  let cached: string | null = null;
  try {
    cached = sessionStorage.getItem(SOURCE_EXISTS_KEY);
  } catch {
    // sessionStorage unavailable; probe every load.
  }

  if (cached === "0") {
    debugLog("info", `Site "${site}" not configured (cached), using ${fallback}`);
    return fallback;
  }
  if (cached !== null) {
    return site;
  }

  const params = new URLSearchParams({ o: site, purpose: "check-source-exists" });
  if (node) {
    params.set("t", node);
  }

  try {
    await fetch(`https://${host || DEFAULT_CHECK_HOST}/config?${params.toString()}`);
    try {
      sessionStorage.setItem(SOURCE_EXISTS_KEY, "1");
    } catch {
      // sessionStorage unavailable
    }
    return site;
  } catch {
    debugLog("info", `Site "${site}" not configured, falling back to ${fallback}`);
    try {
      sessionStorage.setItem(SOURCE_EXISTS_KEY, "0");
    } catch {
      // sessionStorage unavailable
    }
    return fallback;
  }
}

export { checkSourceExists };
