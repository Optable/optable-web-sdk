# Prebid RTD Module

`buildRTD(options)` builds the config object behind the Optable RTD provider: its `handleRtd` merges cached EIDs into a Prebid auction's `ortb2Fragments`, routing each EID to its bidder (or to `global`) and applying a merge strategy per source. While `enableContextual()` returns true, it also merges the page's contextual classifications into `ortb2Fragments.global.site`.

## Usage

```js
import { buildRTD } from "@optable/web-sdk/lib/dist/core/prebid/rtd";

const rtd = buildRTD({
  waitForTargeting: true,
  isControlGroup: () => isControlGroup,
});
```

## Auction flow

On each auction, `handleRtd`:

1. While `enableContextual()` returns true, merges contextual data (see below), for the control group too. The control group merges immediately; other auctions merge after any targeting wait (step 4), so a response that lands during it is used.
2. Returns null while `isControlGroup()` is true, so no EIDs reach bids.
3. Serves from the cache immediately when it holds EIDs.
4. Otherwise, with `waitForTargeting` on and a Prebid `auctionDelay` configured, waits for the `optable-targeting:change` event (sent whenever the SDK writes the targeting cache) up to `auctionDelay`, then serves whatever the cache holds. A cache entry without EIDs does not skip the wait: targeting may still be in flight. The delay is read from `window[prebidGlobal]`, so a page running several Prebid instances has to name the one whose `realTimeData` config carries it, or no wait happens and the auction is served unenriched.
5. Routes each EID to the bidders configured for its source, falling back to `global` for unknown sources or bidders absent from the auction, and merges per the source's strategy.

## Contextual data

Off by default: the wrapper turns it on with an `enableContextual` callback, evaluated per auction like `isControlGroup`, so it can follow a split-test assignment. The module reads the latest `ctxSegments()` response cached on the SDK instance at `window.optable[instance]` (`ctxSegmentsFromCache()`); it never requests or waits for one. Enable `initContextual` so the response is cached before the first auction. Nothing is merged when there is no response.

| Classification | ORTB2 field                                                                                           |
| -------------- | ----------------------------------------------------------------------------------------------------- |
| Categories     | `site.content.data[]`: `{ name: "optable.co", ext: { segtax }, segment: [{ id }] }`, one per taxonomy |
| Keywords       | `site.content.keywords`: every keyword, comma-separated, by prominence                                |

Brand safety, sentiment, emotions and entities are not served to bidders yet.

`segtax` follows AdCOM's category taxonomy list: `6` for `iab_ct_2_2`, `9` for `iab_ct_3_1`. Categories of any other taxonomy are dropped. The merge keeps the publisher's own entries: it replaces only `optable.co` data entries and leaves the publisher's keywords untouched apart from trailing separators, appending to `keywords` only ours it lacks, ignoring case and surrounding spaces (and to `kwarray` too when the publisher set it, so adapters reading either field see them). Keywords keep their case and length; commas inside a keyword become spaces and whitespace is collapsed. Unlike the GAM `ctx_kw` values, they are not lowercased, stripped of GAM-reserved characters, truncated, or capped at 10.

## Options

| Option                  | Default            | Description                                                                                                                               |
| ----------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `waitForTargeting`      | `false`            | Wait for a targeting response when the cache has no EIDs (up to Prebid's `auctionDelay`).                                                 |
| `prebidGlobal`          | `"pbjs"`           | Name of the Prebid global whose `realTimeData.auctionDelay` bounds that wait.                                                             |
| `enableContextual`      | `() => false`      | Contextual switch, evaluated per auction; while true, the SDK instance's contextual classifications are merged into the auction's `site`. |
| `isControlGroup`        | `() => false`      | Split-test gate, evaluated per auction; while true, `handleRtd` serves no EIDs. Contextual data is still served.                          |
| `eidSources`            | built-in routing   | Per-source bidder routes and merge strategy. Pass `{}` to route everything to `global`.                                                   |
| `mergeStrategy`         | append             | Global merge strategy; `appendMergeStrategy`, `prependMergeStrategy`, `replaceMergeStrategy` and `appendNewMergeStrategy` are exported.   |
| `skipMerge`             | `() => false`      | Per-source veto called at merge time.                                                                                                     |
| `matcherFilter`         | `[]`               | Only EIDs whose `matcher` is listed are served.                                                                                           |
| `matcherExclude`        | `[]`               | EIDs whose `matcher` is listed are dropped.                                                                                               |
| `optableCacheTargeting` | `OPTABLE_RESOLVED` | localStorage key of the targeting cache.                                                                                                  |
| `targetingData`         | read from cache    | Explicit targeting data, bypassing the cache and the wait.                                                                                |
| `forceGlobalRouting`    | `false`            | Route every EID to `global` instead of per-bidder.                                                                                        |
| `enableLogging`         | `false`            | Verbose logging. Also enabled by the `optableDebug` flag.                                                                                 |
| `instance`              | `"instance"`       | Name of the SDK instance on `window.optable`.                                                                                             |

`buildRTD` also honors the `optableForceGlobalRouting` and `optableForceSkipMerge` [QA flags](../flags.md).

Cache-only metadata (`_ref` UID2 refresh material) is stripped from EIDs before they reach bid requests.
