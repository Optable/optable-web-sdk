# Prebid RTD Module

`buildRTD(options)` builds the config object behind the Optable RTD provider: its `handleRtd` merges cached EIDs into a Prebid auction's `ortb2Fragments`, routing each EID to its bidder (or to `global`) and applying a merge strategy per source.

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

1. Returns null while `isControlGroup()` is true — no EIDs reach bids.
2. Serves from the cache immediately when it holds EIDs.
3. Otherwise, with `waitForTargeting` on and a Prebid `auctionDelay` configured, waits for the `optable-targeting:change` event (sent whenever the SDK writes the targeting cache) up to the auction delay, then serves whatever the cache holds. A cache entry without EIDs does not skip the wait: targeting may still be in flight.
4. Routes each EID to the bidders configured for its source, falling back to `global` for unknown sources or bidders absent from the auction, and merges per the source's strategy.

## Options

| Option                  | Default            | Description                                                                                                                             |
| ----------------------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| `waitForTargeting`      | `false`            | Wait (bounded by Prebid's `auctionDelay`) for a targeting response when the cache has no EIDs.                                          |
| `isControlGroup`        | `() => false`      | Split-test gate, evaluated per auction; while true, `handleRtd` serves no EIDs.                                                         |
| `eidSources`            | built-in routing   | Per-source bidder routes and merge strategy. Pass `{}` to route everything to `global`.                                                 |
| `mergeStrategy`         | append             | Global merge strategy; `appendMergeStrategy`, `prependMergeStrategy`, `replaceMergeStrategy` and `appendNewMergeStrategy` are exported. |
| `skipMerge`             | `() => false`      | Per-source veto called at merge time.                                                                                                   |
| `matcherFilter`         | `[]`               | Only EIDs whose `matcher` is listed are served.                                                                                         |
| `matcherExclude`        | `[]`               | EIDs whose `matcher` is listed are dropped.                                                                                             |
| `optableCacheTargeting` | `OPTABLE_RESOLVED` | localStorage key of the targeting cache.                                                                                                |
| `targetingData`         | read from cache    | Explicit targeting data, bypassing the cache and the wait.                                                                              |
| `forceGlobalRouting`    | `false`            | Route every EID to `global` instead of per-bidder.                                                                                      |
| `enableLogging`         | `false`            | Verbose logging. Also enabled by the `optableDebug` flag.                                                                               |
| `instance`              | `"instance"`       | Name of the SDK instance on `window.optable`.                                                                                           |

`buildRTD` also honors the `optableForceGlobalRouting` and `optableForceSkipMerge` [QA flags](../flags.md).

Cache-only metadata (`_ref` UID2 refresh material) is stripped from EIDs before they reach bid requests.
