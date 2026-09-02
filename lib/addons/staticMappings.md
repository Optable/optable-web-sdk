# Static Mappings Addon

Applies a wrapper's customer configuration defaults onto `window.optable`, so values a publisher sets on the page before the wrapper script loads always win.

## Usage

The wrapper passes its customer defaults; the addon fills in whatever the publisher left unset:

```js
import { setStaticMappings } from "@optable/web-sdk/lib/dist/addons/staticMappings";

setStaticMappings({
  defaultSite: "customer-sdk",
  node: "customer-node",
  analytics: {
    tenant: "customer",
    sample: 0.1,
    pbjsObjectName: "pbjs",
  },
  withID5: true,
});

// Values that are unconditional or derived from other keys stay in the wrapper:
window.optable.wrapperVersion = SDK_WRAPPER_VERSION;
window.optable.site = window.optable.site ?? window.optable.defaultSite;
window.optable.analytics.pbjsObject =
  window.optable.analytics.pbjsObject ?? window[window.optable.analytics.pbjsObjectName];
```

`window.optable` is created if the page did not define it.

## Merge rules

- When the existing value and the default are both plain objects, they merge recursively, so nested config like `analytics.*` defaults key by key.
- Everything else is a leaf: the default is assigned as-is, and only when the current value is `null` or `undefined`. An absent object default is therefore assigned by reference, not cloned.
- A publisher value that is not a plain object is never recursed into or replaced by an object default.

Object values that are not config sections — a prebid global, for instance — should be assigned caller-side (like `pbjsObject` above) rather than passed as defaults, so a publisher-supplied object is never merged with the default one.

A default therefore never overrides an explicit publisher value. A publisher setting `sample = 0` or an empty string keeps it, and `0`, `""` and `false` all survive.
