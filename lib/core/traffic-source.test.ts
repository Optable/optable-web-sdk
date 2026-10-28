import { getTrafficSource, TRAFFIC_SOURCE_KEY } from "./traffic-source";

function visit(url: string, referrer = "") {
  const { hostname, search } = new URL(url);
  Object.defineProperty(window, "location", {
    value: { hostname, search },
    writable: true,
    configurable: true,
  });
  Object.defineProperty(document, "referrer", { value: referrer, configurable: true });
}

beforeEach(() => {
  sessionStorage.clear();
});

describe("getTrafficSource - classification", () => {
  it("reports direct without a referrer key when there is no referrer", () => {
    visit("https://www.site.com/");
    expect(getTrafficSource()).toStrictEqual({ trafficSource: "direct" });
  });

  it("reports direct without a referrer key when the referrer is not a valid URL", () => {
    visit("https://www.site.com/", "not a url");
    expect(getTrafficSource()).toStrictEqual({ trafficSource: "direct" });
  });

  it("omits referrer for a paid visit without a referrer", () => {
    visit("https://www.site.com/?gclid=abc");
    expect(getTrafficSource()).toStrictEqual({ trafficSource: "paid" });
  });

  it("reports internal for the same host", () => {
    visit("https://www.site.com/b", "https://www.site.com/a");
    expect(getTrafficSource().trafficSource).toBe("internal");
  });

  it("reports internal for another subdomain of the same site", () => {
    visit("https://www.site.com/b", "https://news.site.com/a");
    expect(getTrafficSource().trafficSource).toBe("internal");
  });

  it("reports internal for subdomains under a two-part suffix", () => {
    visit("https://www.site.co.uk/b", "https://news.site.co.uk/a");
    expect(getTrafficSource().trafficSource).toBe("internal");
  });

  it("reports internal before campaign when an internal link carries UTM params", () => {
    visit("https://www.site.com/b?utm_source=newsletter&utm_medium=email", "https://www.site.com/a");
    expect(getTrafficSource().trafficSource).toBe("internal");
  });

  it("reports paid for a click id", () => {
    visit("https://www.site.com/?gclid=abc", "https://www.google.com/");
    expect(getTrafficSource()).toEqual({ referrer: "www.google.com", trafficSource: "paid" });
  });

  it("reports paid for a paid utm_medium, case-insensitively", () => {
    visit("https://www.site.com/?utm_source=fb&utm_medium=CPC");
    expect(getTrafficSource().trafficSource).toBe("paid");
  });

  it("reports email for utm_medium=email", () => {
    visit("https://www.site.com/?utm_source=newsletter&utm_medium=email");
    expect(getTrafficSource().trafficSource).toBe("email");
  });

  it("reports campaign for utm_source without a paid or email medium", () => {
    visit("https://www.site.com/?utm_source=partner", "https://partner.com/");
    expect(getTrafficSource().trafficSource).toBe("campaign");
  });

  it("reports organic_search for a search engine", () => {
    visit("https://www.site.com/", "https://www.google.co.uk/");
    expect(getTrafficSource()).toEqual({ referrer: "www.google.co.uk", trafficSource: "organic_search" });
  });

  it("reports social for a social network", () => {
    visit("https://www.site.com/", "https://t.co/xyz");
    expect(getTrafficSource()).toEqual({ referrer: "t.co", trafficSource: "social" });
  });

  it("reports referral for any other site", () => {
    visit("https://www.site.com/", "https://blog.example.org/post?email=a@b.c");
    expect(getTrafficSource()).toEqual({ referrer: "blog.example.org", trafficSource: "referral" });
  });
});

describe("getTrafficSource - session caching", () => {
  it("keeps the first external source across internal navigation", () => {
    visit("https://www.site.com/a", "https://www.google.com/");
    expect(getTrafficSource().trafficSource).toBe("organic_search");

    visit("https://www.site.com/b", "https://www.site.com/a");
    expect(getTrafficSource()).toEqual({ referrer: "www.google.com", trafficSource: "organic_search" });
  });

  it("does not replace a cached external source with a later one", () => {
    visit("https://www.site.com/a", "https://www.google.com/");
    getTrafficSource();

    visit("https://www.site.com/b", "https://www.facebook.com/");
    expect(getTrafficSource().trafficSource).toBe("organic_search");
  });

  it("does not cache internal", () => {
    visit("https://www.site.com/b", "https://www.site.com/a");
    expect(getTrafficSource().trafficSource).toBe("internal");
    expect(sessionStorage.getItem(TRAFFIC_SOURCE_KEY)).toBeNull();
  });

  it("keeps a cached direct across internal navigation", () => {
    visit("https://www.site.com/a");
    getTrafficSource();

    visit("https://www.site.com/b", "https://www.site.com/a");
    expect(getTrafficSource()).toStrictEqual({ trafficSource: "direct" });
  });

  it("omits an empty referrer cached by an earlier SDK version", () => {
    sessionStorage.setItem(TRAFFIC_SOURCE_KEY, JSON.stringify({ referrer: "", trafficSource: "paid" }));
    visit("https://www.site.com/b", "https://www.site.com/a");
    expect(getTrafficSource()).toStrictEqual({ trafficSource: "paid" });
  });

  it("replaces a cached direct with a later external source", () => {
    visit("https://www.site.com/a");
    getTrafficSource();

    visit("https://www.site.com/b", "https://www.facebook.com/");
    expect(getTrafficSource()).toEqual({ referrer: "www.facebook.com", trafficSource: "social" });

    visit("https://www.site.com/c", "https://www.site.com/b");
    expect(getTrafficSource().trafficSource).toBe("social");
  });

  it("recomputes when the cached value is malformed", () => {
    sessionStorage.setItem(TRAFFIC_SOURCE_KEY, "{not json");
    visit("https://www.site.com/", "https://www.bing.com/");
    expect(getTrafficSource().trafficSource).toBe("organic_search");
  });
});
