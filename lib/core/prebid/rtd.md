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
3. Otherwise, with `waitForTargeting` on and a Prebid `auctionDelay` configured, waits for the `optable-targeting:change` event (sent whenever the SDK writes the targeting cache) up to the auction delay, then serves whatever the cache holds. A cache entry without EIDs does not skip the wait: targeting may still be in flight. The delay is read from `window[prebidGlobal]`, so a page running several Prebid instances has to name the one whose `realTimeData` config carries it, or no wait happens and the auction is served unenriched.
4. Applies `eidRules`, if any, to narrow routing for this auction (see [EID routing rules](#eid-routing-rules)).
5. Routes each EID to the bidders configured for its source, falling back to `global` for unknown sources or bidders absent from the auction, and merges per the source's strategy.

## Options

| Option                  | Default            | Description                                                                                                                             |
| ----------------------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| `waitForTargeting`      | `false`            | Wait (bounded by Prebid's `auctionDelay`) for a targeting response when the cache has no EIDs.                                          |
| `prebidGlobal`          | `"pbjs"`           | Name of the Prebid global whose `realTimeData.auctionDelay` bounds that wait.                                                           |
| `isControlGroup`        | `() => false`      | Split-test gate, evaluated per auction; while true, `handleRtd` serves no EIDs.                                                         |
| `eidSources`            | built-in routing   | Per-source bidder routes and merge strategy. Pass `{}` to route everything to `global`.                                                 |
| `eidRules`              | `[]`               | Ordered per-auction routing rules applied on top of `eidSources`. See below.                                                            |
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

## EID routing rules

`eidRules` decides, per auction, which bidders receive which Optable EIDs. Use it to keep a partner's own ID with that partner, or to hold bidders out when another identity provider already resolved the user.

```js
const rtd = buildRTD({
  eidRules: [
    // keep a partner's own ID with that partner
    { sources: ["triplelift.com"], routes: ["triplelift"] },
    // hold named bidders out when another provider already resolved the user
    { when: { sourcePresent: "liveintent" }, exclude: ["criteo", "taboola"] },
    // give one bidder a source it would not otherwise get
    { sources: ["uidapi.com"], include: ["ttd"] },
  ],
});
```

Every field is optional:

| Field                | Description                                                                                                |
| -------------------- | ---------------------------------------------------------------------------------------------------------- |
| `sources`            | Substring (or list) matched against the EID source. Omitted: every source.                                 |
| `when.sourcePresent` | Rule applies only if an EID whose source contains this substring is already in the auction's global ORTB2. |
| `when.sourceAbsent`  | Rule applies only if no such EID is present.                                                               |
| `routes`             | Replace the set of bidders. `"global"` means every bidder in the auction.                                  |
| `include`            | Add bidders to the set.                                                                                    |
| `exclude`            | Remove bidders from the set. `ix` also removes the `ix-s2s` and `ix_s2s` aliases.                          |

How they are applied:

- For each source, the working set starts as the routes `eidSources` gives it, or every bidder in the auction when it would have gone to `global`. Every matching rule then changes that set, in order.
- Auction bidders are the adUnit bidders plus the `s2sConfig` bidders of the `prebidGlobal` instance.
- Conditions only look at EIDs other providers put in the global ORTB2, not at Optable's own (`inserter: "optable.co"`, for example from pubProvidedId). Prebid runs the userId module before RTD providers, so its EIDs are already there.
- A source no rule touches keeps its usual routing. A source whose set still holds every auction bidder stays in `global`.
- A source a rule narrowed goes only to the listed bidders that are in the auction, in their own `ortb2Fragments.bidder` entry (created if Prebid has none). It never falls back to `global`, and a source whose set ends up empty is not sent at all.
- When no bidders can be found in the auction, rules are skipped and routing is unchanged.
- `rtd.eidRules` is read on every auction, so a wrapper can replace it at any time.

Things to check before trusting a rule on a live page:

- A bidder that is not in the auction withholds nothing, while the rule still looks like it worked. Check the bidder names against the auction.
- Matching on a source the auction never carries silently disables the rule.
- Once a rule fires, the narrowed EIDs leave the global ORTB2, so anything reading `ortb2.user.ext.eids` globally (secure signals, analytics) sees fewer of them.
