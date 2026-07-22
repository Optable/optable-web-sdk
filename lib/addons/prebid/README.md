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
import { initPrebidAnalytics } from "@optable/web-sdk/lib/dist/addons/prebid/analytics";

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
    // Any OptablePrebidAnalyticsConfig option is forwarded, e.g.
    // getSplitTestAssignment: () => window.optable?.selectedTest?.id,
  },
});
```

`initPrebidAnalytics` reuses the SDK instance you already set up for
targeting/identify rather than creating its own. The tenant reported in every
payload is read from that instance's `node`.

### Manual setup

For full control over the instances, wire the pieces up yourself:

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
    host: "na.edge.optable.co",
    node: "analytics",
    site: "analytics",
    readOnly: true,
    cookies: false,
  });

  window.optable.analytics = new OptablePrebidAnalytics(window.optable[`${tenant}_analytics`], {
    analytics: true,
    debug: !!sessionStorage.optableDebug,
    samplingRate: 0.75,
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

### `initPrebidAnalytics(options)`

Bootstraps the integration and returns the `OptablePrebidAnalytics` instance, or `null` when no Prebid.js instance is provided.

- `options.sdkInstance`: An already-initialized Optable SDK instance. The tenant reported in the payload is read from its `node`.
- `options.pbjsInstance`: The Prebid.js instance to hook into (e.g. `window.pbjs`).
- `options.analytics`: Config forwarded to the `OptablePrebidAnalytics` constructor (`samplingRate`, `debug`, `getSplitTestAssignment`, …).

### `OptablePrebidAnalytics`

- **Constructor**:
  `new OptablePrebidAnalytics(sdkInstance, options)`
  - `sdkInstance`: An instance of the Optable SDK.
  - `options`: Object with options such as `debug`, `analytics`, and `samplingRate`. The payload tenant is derived from the SDK instance's `node`.

- **hookIntoPrebid(pbjs)**:
  Hooks the analytics into the provided Prebid.js instance.

## Example

```js
window.optable.customAnalytics = function () {
  return {
    pageType: "homepage",
    userSegment: "premium",
  };
};
```
