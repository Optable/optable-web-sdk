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

const analytics = initPrebidAnalytics({
  SDK: OptableSDK,
  instance: { host: "na.edge.optable.co", node: "my-tenant", site: "my-site" },
  analytics: {
    samplingRate: 0.1,
  },
});
```

`initPrebidAnalytics` returns the analytics instance, or `null` when no Prebid.js
global is present (in which case no SDK instance is created). The analytics SDK
is created with `readOnly: true` and `cookies: false` by default — you only pass
`host`/`node`/`site`. The tenant reported in every payload is derived from
`instance.node`.

### With split-test assignment

When A/B testing, the analytics payload can record which variant each bid belonged
to via a per-bid `splitTestAssignment` field. There are two ways that field gets
populated:

1. **From the bid itself** — if `ortb2Imp.ext.optable.splitTestAssignment` is already
   set on the Prebid bid (e.g. the [A/B test addon](../abTestAssignment.md) stamped
   it), the addon reads it directly.
2. **From `getSplitTestAssignment`** — a callback you configure. When set, its return
   value is stamped onto **every** bid as it is built (initial requests, received
   bids, and won bids), and it **takes precedence** over any value already on the
   bid. Return `undefined` to fall back to the value on the bid.

Use `getSplitTestAssignment` when the assignment lives in your own code rather than
on the bids. This replaces the older pattern of wrapping `trackAuctionEnd` to mutate
Prebid events yourself — the callback covers received/won bids too, which an
`auctionEnd`-only wrapper would miss.

```js
import { setupAB } from "@optable/web-sdk/lib/addons/abTestAssignment";

const ab = setupAB({
  variants: [{ id: "production" }, { id: "test", trafficPercentage: 5 }],
});

const analytics = initPrebidAnalytics({
  SDK: OptableSDK,
  instance: { host: "na.edge.optable.co", node: "my-tenant", site: "my-site" },
  analytics: {
    samplingRate: 0.1,
    // Map "none" to "test" so control/holdout still reports a comparable bucket.
    getSplitTestAssignment: () => (ab.variant.id === "none" ? "test" : ab.variant.id),
  },
});
```

The resolved value appears on every bid in the payload as
`bidderRequests[].bids[].splitTestAssignment`.

### Passing an explicit Prebid instance

By default the addon reads `window.pbjs`. Pass `pbjsInstance` (or `pbjsInstanceName`
to change the window key) when Prebid lives elsewhere. Hooking is deferred via
`pbjs.que` automatically when `pbjs.onEvent` is not yet available, so you do not
need to wrap the call yourself.

```js
const analytics = initPrebidAnalytics({
  SDK: OptableSDK,
  instance: { host: "na.edge.optable.co", node: "my-tenant", site: "my-site" },
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

| Option             | Type                           | Default  | Description                                                                                          |
| ------------------ | ------------------------------ | -------- | ---------------------------------------------------------------------------------------------------- |
| `SDK`              | `new (config) => OptableSDK`   | required | The Optable SDK constructor. Passed in so this module keeps a type-only SDK import.                  |
| `instance`         | `InitConfig`                   | required | Config for the read-only analytics SDK (`host`/`node`/`site`/…). `readOnly`/`cookies` default false. |
| `pbjsInstance`     | `object`                       | —        | Prebid.js instance to hook into. When omitted, `window[pbjsInstanceName]` is used.                   |
| `pbjsInstanceName` | `string`                       | `"pbjs"` | Window key used to find Prebid when `pbjsInstance` is not passed.                                    |
| `analytics`        | `OptablePrebidAnalyticsConfig` | —        | Analytics behavior forwarded to the collector (see below). `analytics: true` is applied by default.  |

Returns the `OptablePrebidAnalytics` instance, or `null` when no Prebid global is found.

### `OptablePrebidAnalyticsConfig`

| Option                   | Type                        | Default   | Description                                                                                                         |
| ------------------------ | --------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------- |
| `analytics`              | `boolean`                   | —         | Master switch. When falsy, events are logged (in debug) but not sent to Witness. `initPrebidAnalytics` sets `true`. |
| `debug`                  | `boolean`                   | `false`   | When true, logs collector activity to the console.                                                                  |
| `bidWinTimeout`          | `number`                    | `10000`   | Milliseconds to wait after `auctionEnd` before sending, to collect `bidWon` events.                                 |
| `samplingRate`           | `number`                    | `1`       | Fraction of events/sessions sampled (0–1). `<= 0` sends nothing; `>= 1` sends everything.                           |
| `samplingVolume`         | `"session"` \| `"event"`    | `"event"` | `"event"` re-rolls sampling per auction; `"session"` decides once per session.                                      |
| `samplingSeed`           | `string`                    | —         | Deterministic sampling seed (e.g. a user id) instead of random sampling.                                            |
| `samplingRateFn`         | `() => boolean`             | —         | Custom sampling predicate; overrides the other sampling options when set.                                           |
| `getSplitTestAssignment` | `() => string \| undefined` | —         | Returns the split-test assignment stamped onto every bid. Takes precedence over the value on the bid.               |

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
