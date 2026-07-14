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

const TARGETING_DONE_KEY = "OPTABLE_TARGETING_DONE";

/** True if the current user agent looks like a known bot/crawler. */
export function isBot(userAgent: string = navigator.userAgent): boolean {
  return BOT_PATTERN.test(userAgent || "");
}

/**
 * Skip targeting for bots by marking targeting as already done,
 * so RTD short-circuits and returns null. No-op for real users.
 * Returns whether the request was identified as a bot.
 */
export function enableBotDetection(): boolean {
  if (isBot()) {
    sessionStorage.setItem(TARGETING_DONE_KEY, "1");
    return true;
  }
  return false;
}
