const TRAFFIC_SOURCE_KEY = "optableTrafficSource";

const SEARCH_SITES = ["google", "bing", "yahoo", "duckduckgo", "ecosia", "baidu", "yandex", "qwant", "startpage"];
const SOCIAL_SITES = [
  "facebook",
  "fb",
  "instagram",
  "twitter",
  "x",
  "t",
  "linkedin",
  "lnkd",
  "reddit",
  "pinterest",
  "tiktok",
  "threads",
  "snapchat",
  "youtube",
];
const PAID_CLICK_IDS = ["gclid", "gbraid", "wbraid", "fbclid", "msclkid", "ttclid", "twclid", "dclid"];
const PAID_MEDIUMS = ["cpc", "ppc", "paid", "paidsocial", "paid_social", "display", "cpm"];

// Suffixes that take two labels, so the registrable name is the third from the
// right (google.co.uk -> google) rather than the second (-> co).
const TWO_PART_SUFFIXES = ["co.uk", "com.au", "co.jp", "co.in", "com.br", "co.nz", "com.mx", "co.za", "co.kr"];

type TrafficSource = "direct" | "internal" | "paid" | "campaign" | "email" | "organic_search" | "social" | "referral";

type TrafficSourceProperties = {
  referrer: string;
  trafficSource: TrafficSource;
};

// Registrable name of a host: "news.google.co.uk" -> "google", "t.co" -> "t".
// Approximate, since resolving this exactly needs the public suffix list.
function siteName(host: string): string {
  const labels = host.toLowerCase().split(".");
  if (labels.length < 2) return labels[0] || "";

  const index = TWO_PART_SUFFIXES.includes(labels.slice(-2).join(".")) ? labels.length - 3 : labels.length - 2;
  return labels[index] || "";
}

function referrerHost(): string {
  if (!document.referrer) return "";

  try {
    return new URL(document.referrer).hostname;
  } catch {
    return "";
  }
}

function classify(host: string): TrafficSource {
  const params = new URLSearchParams(window.location.search);
  const medium = (params.get("utm_medium") || "").toLowerCase();

  if (PAID_CLICK_IDS.some((id) => params.has(id)) || PAID_MEDIUMS.includes(medium)) return "paid";
  if (medium === "email") return "email";
  if (params.has("utm_source")) return "campaign";
  if (!host) return "direct";
  if (host === window.location.hostname) return "internal";

  const site = siteName(host);
  if (SEARCH_SITES.includes(site)) return "organic_search";
  if (SOCIAL_SITES.includes(site)) return "social";

  return "referral";
}

/**
 * Referring host and classified traffic source for the current page.
 *
 * The result is first-touch per tab: the first non-internal classification is
 * cached in `sessionStorage` and reused for the rest of the session. Without
 * that, `document.referrer` becomes the site's own hostname after the first
 * internal click and every later event would report `internal`.
 *
 * Only the referring hostname is reported, never the full referring URL, which
 * can carry query strings with personal data.
 */
function getTrafficSource(): TrafficSourceProperties {
  try {
    const cached = window.sessionStorage?.getItem(TRAFFIC_SOURCE_KEY);
    if (cached) return JSON.parse(cached) as TrafficSourceProperties;
  } catch {
    // sessionStorage unavailable or holding malformed JSON, fall through and recompute.
  }

  const referrer = referrerHost();
  const properties: TrafficSourceProperties = { referrer, trafficSource: classify(referrer) };

  if (properties.trafficSource !== "internal") {
    try {
      window.sessionStorage?.setItem(TRAFFIC_SOURCE_KEY, JSON.stringify(properties));
    } catch {
      // Storage blocked or full, the value is still returned for this event.
    }
  }

  return properties;
}

export type { TrafficSource, TrafficSourceProperties };
export { getTrafficSource, TRAFFIC_SOURCE_KEY };
