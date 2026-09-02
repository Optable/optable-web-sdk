# A/B Test Assignment Addon

This addon manages A/B test assignment for Optable SDK bundles. It handles variant assignment with traffic weighting, sticky assignment via `localStorage`, and a `sessionStorage` override for testing. It also stamps the assigned variant onto Prebid.js bid requests so it is picked up by the Optable Prebid Analytics addon.

## Usage

### Basic setup

```js
import { setupAB } from "@optable/web-sdk/lib/addons/abTestAssignment";

const ab = setupAB({
  variants: [
    { id: "production" }, // treatment — gets remaining traffic (95%)
    { id: "test", trafficPercentage: 5 }, // control — 5%
  ],
});

if (ab.isControl) {
  // Optable is disabled for this user
  window.optable.disabled = true;
}
```

### With Prebid.js analytics

Pass `pbjs` to `setupAB` and hooks are registered automatically. Pass it **before** calling `analytics.hookIntoPrebid()` so bids are stamped before the analytics addon reads them.

```js
import { setupAB } from "@optable/web-sdk/lib/addons/abTestAssignment";
import OptablePrebidAnalytics from "@optable/web-sdk/lib/addons/prebid/analytics";

const ab = setupAB({
  variants: [{ id: "production" }, { id: "test", trafficPercentage: 5 }],
  pbjs, // hooks registered automatically
});

const analytics = new OptablePrebidAnalytics(sdkInstance, { analytics: true });
analytics.hookIntoPrebid();
```

If `pbjs` is not yet available at setup time, call `ab.setHooks(pbjs)` manually once it is:

```js
const ab = setupAB({ variants: [{ id: "production" }, { id: "test", trafficPercentage: 5 }] });
window.pbjs.que.push(() => ab.setHooks(window.pbjs));
```

### Custom variant names

```js
const ab = setupAB({
  variants: [
    { id: "treatment", trafficPercentage: 90 },
    { id: "holdout", trafficPercentage: 10 },
  ],
  controlId: "holdout",
  treatmentId: "treatment",
});
```

### More than two variants

Omit `trafficPercentage` on any variants you want to share the remaining traffic equally.

```js
const ab = setupAB({
  variants: [
    { id: "control", trafficPercentage: 10 },
    { id: "variant-a" }, // 45%
    { id: "variant-b" }, // 45%
  ],
  controlId: "control",
  treatmentId: "variant-a",
});
```

`isControl` is true only for `controlId`. Every other arm — including ones that are
neither the named treatment nor the control — is treated as enabled and keeps its
targeting cache. Set `controlId` explicitly whenever you use more than two variants.

### Variants that change what the edge resolves

A variant may carry any `ABTestConfig` field, not just `id` and `trafficPercentage`.
`skipMatchers`, `skipResolvers` and `matcher_override` are passed through untouched,
so the assigned variant can go straight into `abTests` on the SDK constructor — which
is what puts `skip_matchers` on the targeting request. Setting `skipMatchers` at the
top level of `InitConfig` does nothing; only the selected `abTests` entry is read.

```js
const ab = setupAB({
  variants: [
    { id: "production" }, // 50%
    { id: "skip1p", trafficPercentage: 45, skipMatchers: ["1p"] },
    { id: "test", trafficPercentage: 5 }, // holdout
  ],
});

new OptableSDK({
  ...,
  abTests: [{ ...ab.variant, trafficPercentage: 100 }],
});
```

Only the `id` is read back from `localStorage`, so editing an arm's `skipMatchers` or
its weight applies to users already assigned to it, not just to new ones.

## API

### `setupAB(config)`

**Config options**

| Option        | Type              | Default                | Description                                                                                                                                                                                                                                         |
| ------------- | ----------------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `variants`    | `ABTestVariant[]` | required               | List of variants. Each has an `id`, an optional `trafficPercentage`, and optionally any other `ABTestConfig` field (`skipMatchers`, `skipResolvers`, `matcher_override`). Variants without `trafficPercentage` share the remaining traffic equally. |
| `storageKey`  | `string`          | `"OPTABLE_SPLIT_TEST"` | `localStorage` key used to persist the assignment across sessions.                                                                                                                                                                                  |
| `controlId`   | `string`          | `"test"`               | The variant `id` considered the control group. Used to resolve `isControl` and the `optableControlGroup` flag override.                                                                                                                             |
| `treatmentId` | `string`          | `"production"`         | The variant `id` considered the treatment group. Used to resolve `isControl` and the `optableControlGroup` flag override.                                                                                                                           |
| `sdk`         | `OptableSDK`      | —                      | When provided, uses `sdk.targetingClearCache()` for precise control-group cache clearing instead of a key-prefix scan.                                                                                                                              |
| `pbjs`        | `object`          | —                      | When provided, bid-stamping hooks are registered on `pbjs` automatically at setup time.                                                                                                                                                             |

**Returned object**

| Property              | Type             | Description                                                                                        |
| --------------------- | ---------------- | -------------------------------------------------------------------------------------------------- |
| `variant`             | `ABTestConfig`   | The assigned variant, as configured, with `trafficPercentage` resolved.                            |
| `isControl`           | `boolean`        | `true` when the assigned variant is `controlId`.                                                   |
| `splitTestAssignment` | `string`         | The assigned variant id.                                                                           |
| `setHooks`            | `(pbjs) => void` | Registers bid-stamping hooks on a Prebid instance. Use when `pbjs` is not available at setup time. |

## Overriding the assignment for testing

Add `optableSplitTest` to the page URL to force a variant by id. This is the only
override that reaches an arm which is neither `controlId` nor `treatmentId`:

```
https://example.com/page?optableSplitTest=skip1p
```

An id that is not in `variants` is ignored, and assignment proceeds normally.

Or add `optableControlGroup`:

```
https://example.com/page?optableControlGroup=1   # force control
https://example.com/page?optableControlGroup=0   # force treatment
```

Or set it in `sessionStorage` before the SDK initializes:

```js
sessionStorage.setItem("optableControlGroup", "1"); // force control
sessionStorage.setItem("optableControlGroup", "0"); // force treatment
```

URL params take precedence over `sessionStorage`, and `optableSplitTest` takes precedence over `optableControlGroup`. Clear `localStorage.OPTABLE_SPLIT_TEST` to reset a sticky assignment.
