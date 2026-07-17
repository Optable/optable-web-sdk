# Optable Prebid Analytics Addon

This addon integrates Optable analytics with Prebid.js, allowing you to send auction and bid data to Optable for analysis. It is designed to be used as a plugin within your Optable SDK setup.

## Installation

### Quick start: `initPrebidAnalytics`

`initPrebidAnalytics` bootstraps the whole integration in one call: it creates a
dedicated read-only analytics SDK instance, constructs `OptablePrebidAnalytics`,
and hooks it into the publisher's Prebid.js global. It returns the analytics
instance, or `null` when no Prebid.js global is present (in which case no SDK
instance is created).

```ts
import OptableSDK from "@optable/web-sdk";
import { initPrebidAnalytics } from "@optable/web-sdk/lib/dist/addons/prebid/analytics";

initPrebidAnalytics({
  SDK: OptableSDK,
  // Config for the dedicated read-only analytics SDK instance
  instance: { host: "na.edge.optable.co", node: "analytics", site: "analytics" },
  // Prebid global by name (default "pbjs"), or pass the object directly via `pbjs`
  prebidGlobal: "pbjs",
  // Forwarded to the OptablePrebidAnalytics constructor
  analytics: {
    tenant: "my_tenant",
    samplingRate: 0.1,
    debug: !!sessionStorage.optableDebug,
    // Any OptablePrebidAnalyticsConfig option is forwarded, e.g.
    // getSplitTestAssignment: () => window.optable?.selectedTest?.id,
  },
});
```

The `SDK` constructor is passed in (rather than imported by this module) so that
consumers of the `OptablePrebidAnalytics` class don't bundle the whole SDK. The
`instance` config sets where analytics data is sent; `readOnly: true` and
`cookies: false` are applied by default and can be overridden through `instance`.

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
    tenant,
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

Bootstraps the integration and returns the `OptablePrebidAnalytics` instance, or `null` when no Prebid.js global is present.

- `options.SDK`: The Optable SDK constructor (pass the imported `OptableSDK`).
- `options.instance`: Config for the dedicated read-only analytics SDK instance (`host`/`node`/`site`/…). `readOnly: true` and `cookies: false` default on and can be overridden here.
- `options.pbjs`: The Prebid.js global to hook into. When omitted, `window[prebidGlobal]` is used.
- `options.prebidGlobal`: Name of the prebid global on `window` (default `"pbjs"`), used when `pbjs` is not passed.
- `options.analytics`: Config forwarded to the `OptablePrebidAnalytics` constructor (`tenant`, `samplingRate`, `debug`, `getSplitTestAssignment`, …).

### `OptablePrebidAnalytics`

- **Constructor**:
  `new OptablePrebidAnalytics(sdkInstance, options)`
  - `sdkInstance`: An instance of the Optable SDK.
  - `options`: Object with options such as `debug`, `analytics`, and `tenant`.

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
