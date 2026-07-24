# Optable Prebid Analytics Addon

This addon integrates Optable analytics with Prebid.js, allowing you to send auction and bid data to Optable for analysis. It is designed to be used as a plugin within your Optable SDK setup.

## Installation

### Quick start: `initPrebidAnalytics`

`initPrebidAnalytics` bootstraps the integration in one call: it constructs
`OptablePrebidAnalytics` around an SDK instance you already created and hooks it
into the Prebid.js instance you pass. It returns the analytics instance, or `null`
when no Prebid.js instance is provided.

```ts
import OptableSDK from "@optable/web-sdk";
import { initPrebidAnalytics } from "@optable/web-sdk/lib/addons/prebid/analytics";

const sdk = new OptableSDK({ host: "na.edge.optable.co", node: "analytics", site: "analytics" });

initPrebidAnalytics({
  // An already-initialized Optable SDK instance
  sdkInstance: sdk,
  // The Prebid.js instance to hook into
  pbjsInstance: window.pbjs,
  // Forwarded to the OptablePrebidAnalytics constructor
  analytics: {
    samplingRate: 0.1,
    debug: !!sessionStorage.optableDebug,
    // Any OptablePrebidAnalyticsConfig option is forwarded, e.g. samplingVolume.
  },
});
```

`initPrebidAnalytics` reuses the SDK instance you already set up for
targeting/identify rather than creating its own. The tenant reported in every
payload is read from that instance's `node`.

### Manual setup

For full control, construct the collector yourself and hook it into Prebid.js:

```js
import OptablePrebidAnalytics from "@optable/web-sdk/lib/addons/prebid/analytics";

const analytics = new OptablePrebidAnalytics(sdk, {
  analytics: true,
  debug: !!sessionStorage.optableDebug,
  samplingRate: 0.75,
});
analytics.hookIntoPrebid(window.pbjs);
```

The payload tenant is read from the SDK instance's `node`.

## Usage

- **Sampling**: `samplingRate` (0–1) controls the fraction of events/sessions sent.
- **Debugging**: set `sessionStorage.optableDebug` to enable debug logging.
- **Custom fields**: set `window.optable.customAnalytics` to an async function
  returning an object; its keys are merged into every auction payload.

## API

### `initPrebidAnalytics(options)`

Bootstraps the integration and returns the `OptablePrebidAnalytics` instance, or `null` when no Prebid.js instance is provided.

- `options.sdkInstance`: An already-initialized Optable SDK instance. The tenant reported in the payload is read from its `node`.
- `options.pbjsInstance`: The Prebid.js instance to hook into (e.g. `window.pbjs`).
- `options.analytics`: Config forwarded to the `OptablePrebidAnalytics` constructor (`samplingRate`, `debug`, …).

### `OptablePrebidAnalytics`

- **Constructor**:
  `new OptablePrebidAnalytics(sdkInstance, options)`
  - `sdkInstance`: An instance of the Optable SDK.
  - `options`: Object with options such as `debug`, `analytics`, and `samplingRate`. The payload tenant is derived from the SDK instance's `node`.

- **hookIntoPrebid(pbjs)**:
  Hooks the analytics into the provided Prebid.js instance.
