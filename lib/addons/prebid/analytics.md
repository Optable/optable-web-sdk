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

const sdk = new OptableSDK({ host: "na.edge.optable.co", node: "my-tenant", site: "my-site" });

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
  host: "na.edge.optable.co",
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
`optableMatchers`, `optableSources`, `optableTargetingDone`, `bidWon`, `missed`,
`url`, `tenant`, `prebidjsVersion`, `sessionDepth`, `pageAuctionsCount`,
`originSlug`, and the parsed `userAgent`/`device`.
