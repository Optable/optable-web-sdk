# Bot Detection Addon

This addon identifies requests coming from known bots and crawlers, so a wrapper can skip work that only makes sense for real visitors — edge calls, identity resolution, analytics samples.

It is a pure function over the user agent string. It performs no network calls, reads no storage, and has no side effects.

## Usage

```js
import { isBot } from "@optable/web-sdk/lib/dist/addons/botDetection";

if (isBot()) {
  // Skip targeting, analytics and any other per-visitor work.
  return;
}
```

With no argument it reads `navigator.userAgent`. Pass a string to test one explicitly, which is also how it is unit tested:

```js
isBot("Mozilla/5.0 (compatible; Googlebot/2.1)"); // true
isBot("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"); // false
```

## Skipping targeting for bots

`SkipTargetingForBots()` is the companion helper for the common case. It calls `isBot()` and, when true, writes `OPTABLE_TARGETING_DONE` to `sessionStorage`.

```js
import { SkipTargetingForBots } from "@optable/web-sdk/lib/dist/edge/targeting";

const skipped = SkipTargetingForBots();
if (!skipped) {
  await sdk.targeting();
}
```

It returns whether the request was identified as a bot, and is a no-op for real visitors. Prefer it over a bare `isBot()` early-return when other code on the page can also trigger targeting.

## What is matched

The user agent is tested case-insensitively against a single pattern built from these substrings:

| Category                         | Substrings                                                                                     |
| -------------------------------- | ---------------------------------------------------------------------------------------------- |
| Generic crawlers                 | `bot`, `crawler`, `spider`, `scraper`                                                          |
| Headless browsers and automation | `headless`, `phantomjs`, `selenium`, `webdriver`                                               |
| HTTP clients and runtimes        | `curl`, `wget`, `python`, `java`, `perl`, `ruby`, `go-http-client`, `okhttp`, `axios`, `fetch` |
| API tools                        | `postman`, `insomnia`                                                                          |
| Google non-search agents         | `googleother`, `google-extended`, `google-inspectiontool`                                      |

Matching is substring-based, so `Googlebot`, `bingbot` and `AhrefsBot` are all caught by `bot`.

Two consequences worth knowing:

- **It is deliberately broad.** `java` matches any user agent containing that substring, and the Google entries cover the non-search crawlers that should not consume edge calls. The bias is toward skipping work rather than toward precise classification.
- **It is user-agent only.** A bot that presents a browser user agent is not detected. Treat this as a cost-saving filter, not a security control or a fraud signal.

## API

| Export                 | Signature                         | Description                                                                                                                  |
| ---------------------- | --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `isBot`                | `(userAgent?: string) => boolean` | True when the user agent looks like a known bot. Defaults to `navigator.userAgent`.                                          |
| `SkipTargetingForBots` | `() => boolean`                   | Exported from `lib/edge/targeting`. Marks targeting done for bots so RTD short-circuits. Returns whether a bot was detected. |
