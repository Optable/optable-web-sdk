# A/B Test Assignment Addon

This addon manages A/B test assignment for Optable SDK bundles. It handles variant assignment with traffic weighting, sticky assignment via `localStorage`, and a `sessionStorage` override for testing. It also stamps the assigned variant onto Prebid.js bid requests so it is picked up by the Optable Prebid Analytics addon.

## Usage

### Basic setup

```js
import { setupAB } from "@optable/web-sdk/lib/addons/abTestAssignment";

const ab = setupAB({
  variants: [
    { id: "all" }, // treatment — gets remaining traffic (95%)
    { id: "none", trafficPercentage: 5 }, // control — 5%
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
  variants: [{ id: "all" }, { id: "none", trafficPercentage: 5 }],
  pbjs, // hooks registered automatically
});

const analytics = new OptablePrebidAnalytics(sdkInstance, { analytics: true });
analytics.hookIntoPrebid();
```

If `pbjs` is not yet available at setup time, call `ab.setHooks(pbjs)` manually once it is:

```js
const ab = setupAB({ variants: [{ id: "all" }, { id: "none", trafficPercentage: 5 }] });
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

## API

### `setupAB(config)`

**Config options**

| Option        | Type              | Default                | Description                                                                                                                                       |
| ------------- | ----------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `variants`    | `ABTestVariant[]` | required               | List of variants. Each has an `id` and an optional `trafficPercentage`. Variants without `trafficPercentage` share the remaining traffic equally. |
| `storageKey`  | `string`          | `"OPTABLE_SPLIT_TEST"` | `localStorage` key used to persist the assignment across sessions.                                                                                |
| `controlId`   | `string`          | `"none"`               | The variant `id` considered the control group. Used to resolve `isControl` and the `optableControlGroup` flag override.                           |
| `treatmentId` | `string`          | `"all"`                | The variant `id` considered the treatment group. Used to resolve `isControl` and the `optableControlGroup` flag override.                         |
| `sdk`         | `OptableSDK`      | —                      | When provided, uses `sdk.targetingClearCache()` for precise control-group cache clearing instead of a key-prefix scan.                            |
| `pbjs`        | `object`          | —                      | When provided, bid-stamping hooks are registered on `pbjs` automatically at setup time.                                                           |

**Returned object**

| Property              | Type             | Description                                                                                        |
| --------------------- | ---------------- | -------------------------------------------------------------------------------------------------- |
| `variant`             | `ABTestConfig`   | The assigned variant (`id` + `trafficPercentage`).                                                 |
| `isControl`           | `boolean`        | `true` when the assigned variant is not the treatment.                                             |
| `splitTestAssignment` | `string`         | The assigned variant id.                                                                           |
| `setHooks`            | `(pbjs) => void` | Registers bid-stamping hooks on a Prebid instance. Use when `pbjs` is not available at setup time. |

## Overriding the assignment for testing

Add `optableControlGroup` to the page URL:

```
https://example.com/page?optableControlGroup=1   # force control
https://example.com/page?optableControlGroup=0   # force treatment
```

Or set it in `sessionStorage` before the SDK initializes:

```js
sessionStorage.setItem("optableControlGroup", "1"); // force control
sessionStorage.setItem("optableControlGroup", "0"); // force treatment
```

URL params take precedence over `sessionStorage`. Clear `localStorage.OPTABLE_SPLIT_TEST` to reset a sticky assignment.
