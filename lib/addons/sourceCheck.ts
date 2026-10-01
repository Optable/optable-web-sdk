import { debugLog } from "../core/log";

const SOURCE_EXISTS_KEY = "optable_source_exists";
const DEFAULT_CHECK_HOST = "na.edge.optable.co";
const CHECK_TIMEOUT_MS = 1500;

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

// The verdict is specific to the source being probed, so scope the cache entry
// to the tuple that produced it rather than sharing one key across the origin.
function cacheKey(site: string, node: string | undefined, host: string): string {
  return `${SOURCE_EXISTS_KEY}:${[host, node || "", site].map(encodeURIComponent).join(":")}`;
}

function cacheVerdict(key: string, verdict: string): void {
  try {
    sessionStorage.setItem(key, verdict);
  } catch {
    // sessionStorage unavailable
  }
}

/**
 * Verifies that `site` has a matching source configured in the DCN and
 * returns the site to use: `site` when it exists, `defaultSite` when it does
 * not. The result is cached in sessionStorage, so the probe runs at most once
 * per session. Only a network-level failure (the edge rejecting the unknown
 * origin) marks a source missing.
 */
async function checkSourceExists({ site, defaultSite, node, host }: SourceCheckOptions): Promise<string> {
  const fallback = defaultSite || "default";
  const checkHost = host || DEFAULT_CHECK_HOST;
  const key = cacheKey(site, node, checkHost);

  let cached: string | null = null;
  try {
    cached = sessionStorage.getItem(key);
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

  const controller = new AbortController();
  let timedOut = false;
  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, CHECK_TIMEOUT_MS);

  try {
    await fetch(`https://${checkHost}/config?${params.toString()}`, { signal: controller.signal });
    cacheVerdict(key, "1");
    return site;
  } catch {
    // A timeout is not evidence the source is missing, so fall back for this
    // call without pinning the rest of the session to the fallback.
    if (timedOut) {
      debugLog("info", `Site "${site}" check timed out after ${CHECK_TIMEOUT_MS}ms, using ${fallback}`);
      return fallback;
    }

    debugLog("info", `Site "${site}" not configured, falling back to ${fallback}`);
    cacheVerdict(key, "0");
    return fallback;
  } finally {
    clearTimeout(timeoutId);
  }
}

export { checkSourceExists };
