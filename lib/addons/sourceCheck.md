# Source Check Addon

Verifies that a page's site slug has a matching source configured in the DCN before the SDK is constructed, and falls back to a default source when it does not — so targeting still works with default enrichment on domains that were never provisioned, instead of failing silently. Useful for multi-site publishers.

## Usage

```js
import { checkSourceExists } from "@optable/web-sdk/lib/dist/addons/sourceCheck";

window.optable.site = await checkSourceExists({
  site: window.optable.site,
  defaultSite: window.optable.defaultSite,
  node: "customer-node",
});
```

Returns the site to use: `site` when the source exists, `defaultSite` (or `"default-sdk"` when that is empty) when it does not. Call it before constructing the SDK and pass the result as the constructor's `site`.

## Behaviour

- Probes `https://<host>/config?o=<site>&t=<node>&purpose=check-source-exists` (`host` defaults to `na.edge.optable.co`). Only a network-level failure — the edge rejecting the unknown origin — marks the source missing; any HTTP response counts as existing.
- The result is cached in `sessionStorage` (`optable_source_exists`), so the probe runs at most once per session.
- A browser with `sessionStorage` blocked degrades to probing every page load.
