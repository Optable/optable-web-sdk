# Prebid Analytics Addon

This addon collects Prebid.js auction data and reports it to the Optable Witness
API. It hooks into `auctionEnd` and `bidWon` events, replays any events that
fired before the hook attached, tags bidder requests with Optable EID metadata
(matchers/sources), and sends a structured `optable.prebid.auction` payload.

It exposes two things:

- `initPrebidAnalytics(options)` — a bootstrap helper that creates the analytics
  SDK instance, constructs the collector, and hooks it into Prebid for you. Use
  this unless you need to manage those pieces yourself.
- `OptablePrebidAnalytics` — the collector class, for advanced setups.

## Usage

### Basic setup (recommended)

```js
import OptableSDK from "@optable/web-sdk";
import { initPrebidAnalytics } from "@optable/web-sdk/lib/addons/prebid/analytics";

const sdk = new OptableSDK({ host: "us.edge.optable.co", node: "my-tenant", site: "my-site" });

const analytics = initPrebidAnalytics({
  sdkInstance: sdk,
  pbjsInstance: window.pbjs,
  analytics: {
    samplingRate: 0.1,
  },
});
```

`initPrebidAnalytics` takes an already-initialized Optable SDK instance and the
Prebid.js instance to hook into, and returns the analytics instance (or `null`
when no Prebid.js instance is provided). The tenant reported in every payload is
read from the SDK instance's `node`.

### With split-test assignment

The addon reports a per-bid `splitTestAssignment`, read verbatim from the bid's
`ortb2Imp.ext.optable.splitTestAssignment` (it does no transformation). Use the
[`setupAB` addon](../abTestAssignment.md) to assign a variant and stamp that field
onto every bid; the value then appears in the payload as
`bidderRequests[].bids[].splitTestAssignment`.

### Passing an explicit Prebid instance

`pbjsInstance` is the Prebid.js instance to hook into — pass `window.pbjs`, or any
other instance when Prebid lives elsewhere. Hooking is deferred via `pbjs.que`
automatically when `pbjs.onEvent` is not yet available, so you do not need to wrap
the call yourself.

```js
const analytics = initPrebidAnalytics({
  sdkInstance: sdk,
  pbjsInstance: myPrebidInstance,
});
```

### Custom payload fields

Set `window.optable.customAnalytics` to an async function returning an object; its
keys are merged into every auction payload:

```js
window.optable.customAnalytics = async () => ({ experiment: "floor-v2" });
```

### Advanced: managing the collector directly

```js
import OptablePrebidAnalytics from "@optable/web-sdk/lib/addons/prebid/analytics";

const sdk = new OptableSDK({
  host: "us.edge.optable.co",
  node: "my-tenant",
  site: "my-site",
  readOnly: true,
  cookies: false,
});

const analytics = new OptablePrebidAnalytics(sdk, {
  analytics: true,
  samplingRate: 0.1,
});

analytics.hookIntoPrebid(window.pbjs);
```

The tenant reported in the payload is taken from the SDK instance's `node`.

## API

### `initPrebidAnalytics(options)`

**Options**

| Option         | Type                           | Default  | Description                                                                                         |
| -------------- | ------------------------------ | -------- | --------------------------------------------------------------------------------------------------- |
| `sdkInstance`  | `OptableSDK`                   | required | An already-initialized Optable SDK instance. The payload tenant is read from its `node`.            |
| `pbjsInstance` | `object`                       | required | The Prebid.js instance to hook into (e.g. `window.pbjs`).                                           |
| `analytics`    | `OptablePrebidAnalyticsConfig` | —        | Analytics behavior forwarded to the collector (see below). `analytics: true` is applied by default. |

Returns the `OptablePrebidAnalytics` instance, or `null` when no Prebid instance is provided.

### `OptablePrebidAnalyticsConfig`

| Option           | Type                     | Default   | Description                                                                                                         |
| ---------------- | ------------------------ | --------- | ------------------------------------------------------------------------------------------------------------------- |
| `analytics`      | `boolean`                | —         | Master switch. When falsy, events are logged (in debug) but not sent to Witness. `initPrebidAnalytics` sets `true`. |
| `debug`          | `boolean`                | `false`   | When true, logs collector activity to the console.                                                                  |
| `bidWinTimeout`  | `number`                 | `10000`   | Milliseconds to wait after `auctionEnd` before sending, to collect `bidWon` events.                                 |
| `samplingRate`   | `number`                 | `1`       | Fraction of events/sessions sampled (0–1). `<= 0` sends nothing; `>= 1` sends everything.                           |
| `samplingVolume` | `"session"` \| `"event"` | `"event"` | `"event"` re-rolls sampling per auction; `"session"` decides once per session.                                      |
| `samplingSeed`   | `string`                 | —         | Deterministic sampling seed (e.g. a user id) instead of random sampling.                                            |
| `samplingRateFn` | `() => boolean`          | —         | Custom sampling predicate; overrides the other sampling options when set.                                           |

### `OptablePrebidAnalytics` instance

| Member           | Type                 | Description                                                                                                     |
| ---------------- | -------------------- | --------------------------------------------------------------------------------------------------------------- |
| `isInitialized`  | `boolean`            | `true` once the constructor has run.                                                                            |
| `hookIntoPrebid` | `(pbjs?) => boolean` | Attaches event hooks. Defers via `pbjs.que` when `onEvent` is not ready. Returns `false` when Prebid is absent. |
| `clearData`      | `() => void`         | Clears stored auction/missed-event state (useful in tests).                                                     |

## Payload

Each sampled auction sends an `optable.prebid.auction` event with, among others:
`bidderRequests` (with per-bid `status`, `cpm`, `size`, `splitTestAssignment`),
`optableMatchers`, `optableSources`, `optableTargetingDone`, `liveintentEIDs`
(with per-bidder `hasLiEids` and `liSources`), `intentiqEIDs`, `growthcodeEIDs`,
`transunionEIDs` (with per-bidder `iiqSources`, `gcSources`, `tuSources`),
`bidWon`, `missed`, `adUnitCode` (first bid's ad unit), `totalBids` (received
bids with a `cpm`), `url`, `referrer`, `trafficSource`, `tenant`,
`prebidjsVersion`, `sessionDepth`, `pageAuctionsCount`, `originSlug`, and the
parsed `userAgent`/`device`.

Received bids are matched to request bids on `requestId`. Prebid Server
responses can carry a `requestId` that matches no client bid; those go to the
first bid of the same bidder and ad unit still without a response. Bids that fit
nowhere are counted in `unmatchedBids`, omitted when 0.

Troubleshooting fields, same meaning as in the V1 add-on. The page-dependent ones
are captured when the auction ends, since the payload is only built after
`bidWinTimeout`:

| Field      | Meaning                                                                                                                                                                                                                                                         |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `slotSeq`  | Earlier auctions on this page whose first ad unit is this auction's first ad unit (0 for the first). Other ad units in the auction aren't counted.                                                                                                              |
| `t0`       | Auction start, in ms from page start.                                                                                                                                                                                                                           |
| `consent`  | Bitmask: 1 GDPR applies, 2 Global Privacy Control, 4 US privacy opt-out, 8 GPP string present, 16 TCF blocked storage for some module on the page. Bits 1, 4 and 8 come from the first bidder request, so an auction without bidder requests reports them as 0. |
| `cacheAge` | Seconds since this SDK's targeting cache was written; `-1` when there is no cache; absent when the cache predates the write timestamp or without device access consent.                                                                                         |
| `idsMs`    | Set when the targeting cache was written during this page view: ms from page start to the write.                                                                                                                                                                |
| `om`       | Per bidder request, a bitmask over `optableSources` (bit i = `optableSources[i]`). Omitted when the bidder received every source.                                                                                                                               |

`referrer` is the referring hostname only, never the full referring URL, and is
omitted when there is none (the edge rejects an empty property value with a 400).
`trafficSource` classifies it as one of `direct`, `internal`, `paid`,
`campaign`, `email`, `organic_search`, `social` or `referral`. Both are
first-touch per tab: the first non-internal result is cached in `sessionStorage`
under `optableTrafficSource` and reused for the rest of the session, because
`document.referrer` becomes the site's own hostname after the first internal
click. A cached `direct` is the exception: a later non-internal result in the
same tab replaces it. A referrer counts as `internal` when its registrable name
matches the page's (`news.site.com` on `www.site.com`), and that check runs
before the UTM and click-id checks.

Competitor EIDs are the EID sources each vendor delivered, matched on the tags it
leaves in the bid request (rules in `COMPETITOR_EIDS`, shared with the V1 add-on):

| Vendor     | Rule                                                                        |
| ---------- | --------------------------------------------------------------------------- |
| LiveIntent | `source === "liveintent.com"` or `uids[].ext.provider === "liveintent.com"` |
| IntentIQ   | `matcher` or `source` is `"intentiq.com"`                                   |
| GrowthCode | `inserter`, `matcher` or `source` is `"growthcode.io"`                      |
| TransUnion | `source === "neustar.biz"` (Fabrick ID)                                     |

The first payload of each page also carries `page`:
`{ optableRTDInstalled, optableRTDConfigured, rtdDelay, udDelay }`.
`optableRTDInstalled` is `1` when `optableRtdProvider` is in `pbjs.installedModules`
(compiled into the Prebid build). `optableRTDConfigured` is `1` when
`realTimeData.dataProviders` contains a provider named `optable`. `rtdDelay` and
`udDelay` are `realTimeData.auctionDelay` and `userSync.auctionDelay`. Same shape
as the V1 add-on.
