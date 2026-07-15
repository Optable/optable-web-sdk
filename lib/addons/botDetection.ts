const BOT_PATTERN = new RegExp(
  [
    "bot",
    "crawler",
    "spider",
    "scraper",
    "headless",
    "phantomjs",
    "selenium",
    "webdriver",
    "curl",
    "wget",
    "python",
    "java",
    "perl",
    "ruby",
    "go-http-client",
    "okhttp",
    "axios",
    "fetch",
    "postman",
    "insomnia",
    "googleother",
    "google-extended",
    "google-inspectiontool",
  ].join("|"),
  "i"
);

/** True if the current user agent looks like a known bot/crawler. */
export function isBot(userAgent: string = navigator.userAgent): boolean {
  return BOT_PATTERN.test(userAgent || "");
}
