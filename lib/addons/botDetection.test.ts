import { isBot } from "./botDetection";

describe("isBot", () => {
  it.each([
    "Googlebot/2.1 (+http://www.google.com/bot.html)",
    "Mozilla/5.0 (compatible; bingbot/2.0)",
    "some-crawler/1.0",
    "spider",
    "Mozilla/5.0 (X11; Linux x86_64) HeadlessChrome/120.0.0.0",
    "PhantomJS/2.1.1",
    "curl/8.4.0",
    "python-requests/2.31.0",
    "axios/1.6.0",
    "PostmanRuntime/7.36.0",
    "GoogleOther",
  ])("returns true for bot user agent %j", (ua) => {
    expect(isBot(ua)).toBe(true);
  });

  it.each([
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Gecko/20100101 Firefox/121.0",
  ])("returns false for real browser user agent %j", (ua) => {
    expect(isBot(ua)).toBe(false);
  });

  it("is case insensitive", () => {
    expect(isBot("GOOGLEBOT")).toBe(true);
    expect(isBot("CuRl/1.0")).toBe(true);
  });

  it("returns false for an empty user agent", () => {
    expect(isBot("")).toBe(false);
  });

  it("falls back to navigator.userAgent when no argument is provided", () => {
    const spy = jest.spyOn(navigator, "userAgent", "get").mockReturnValue("Googlebot/2.1");
    expect(isBot()).toBe(true);
    spy.mockRestore();
  });
});
