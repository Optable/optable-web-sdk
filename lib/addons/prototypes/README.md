# Optable Prebid Analytics Addon

This addon integrates Optable analytics with Prebid.js, allowing you to send auction and bid data to Optable for analysis. It is designed to be used as a plugin within your Optable SDK setup.

## Installation

1. **Configure Analytics**
   Use the following code snippet to enable analytics and configure the integration withing your Optable SDK wrapper:

   ```js
   import OptablePrebidAnalytics from "./analytics";
   // ...
   const tenant = "my_tenant";
   const analyticsSample = sessionStorage.optableEnableAnalytics || 0.1;
   window.optable.runAnalytics = analyticsSample > Math.random();
   // ...

   window.optable.customAnalytics = function () {
     const customAnalyticsObject = {};
     // ...
     return customAnalyticsObject;
   };
   // ...
   if (window.optable.runAnalytics && tenant) {
     window.optable[`${tenant}_analytics`] = new window.optable.SDK({
       host: "us.edge.optable.co",
       node: "analytics",
       site: "analytics",
       readOnly: true,
       cookies: false,
     });

     window.optable.analytics = new OptablePrebidAnalytics(window.optable[`${tenant}_analytics`], {
       analytics: true,
       tenant,
       debug: !!sessionStorage.optableDebug,
     });
     window.optable.analytics.hookIntoPrebid(window.pbjs);
   }
   // ...
   ```

   - Replace 'my_tenant' with your Optable tenant name.
   - Optionally, implement `window.optable.customAnalytics` to add custom key-value pairs to each analytics event.

## Usage

- **Sampling**:
  The `analyticsSample` variable controls the sampling rate. Set it to a float between 0 and 1 to control what fraction of users send analytics.

- **Debugging**:
  Set `sessionStorage.optableDebug` to `true` to force analytics to run and enable debug logging.

- **Custom Analytics Data**:
  Implement `window.optable.customAnalytics` to return an object with custom data to be included in analytics events.

## API

### `OptablePrebidAnalytics`

- **Constructor**:
  `new OptablePrebidAnalytics(sdkInstance, options)`
  - `sdkInstance`: An instance of the Optable SDK.
  - `options`: Object with options such as `debug`, `analytics`, `tenant`, and `cacheKey` (localStorage key of
    the targeting cache, default `OPTABLE_RESOLVED`).

- **hookIntoPrebid(pbjs)**:
  Hooks the analytics into the provided Prebid.js instance.

## Troubleshooting fields in `auction_processed`

Added to make enrichment and uplift problems answerable from the analytics table. All are small, and the
per-bidder field is omitted in the normal case.

| Field                         | Level                        | Meaning                                                                                                                                                                                             |
| ----------------------------- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bidderRequests[].om`         | bidder                       | Which of the auction's `optableSources` this bidder received, as a bitmask: bit `i` is `optableSources[i]`. **Absent means the bidder received every source.** `0` means none.                      |
| `bidderRequests[].bids[].src` | bid                          | `"s2s"` for Prebid Server responses; absent for client-side bids.                                                                                                                                   |
| `unmatchedBids`               | auction                      | Received bids that matched no bidder request, even after falling back to bidder code and ad unit. Absent when 0.                                                                                    |
| `slotSeq`                     | auction                      | Earlier auctions of this ad unit on this page view. `0` is the slot's first auction; higher values are refreshes or re-auctions.                                                                    |
| `t0`                          | auction                      | Milliseconds from page start (`performance.timeOrigin`) to auction start.                                                                                                                           |
| `consent`                     | auction                      | Bitmask: `1` GDPR applies, `2` Global Privacy Control on, `4` US privacy opt-out, `8` GPP string present, `16` TCF blocked storage for some module on this page.                                    |
| `cacheAge`                    | auction                      | Seconds since the targeting cache was written. `-1` when there is no cache. Absent when the cache was written before this field existed.                                                            |
| `idsMs`                       | auction                      | Set when the targeting cache was written during this page view: milliseconds from page start to our IDs landing. Compare with `t0` to see whether an auction started before our IDs were available. |
| `page`                        | first auction of a page only | `{ rtdOptable, rtdDelay, udDelay }`: whether the `optable` RTD provider is registered, `realTimeData.auctionDelay`, and `userSync.auctionDelay`.                                                    |

Cache age relies on the SDK writing a `<cacheKey>:ts` sibling with the write time whenever targeting is
stored (`lib/core/storage.ts`).

## Example

```js
window.optable.customAnalytics = function () {
  return {
    pageType: "homepage",
    userSegment: "premium",
  };
};
```
