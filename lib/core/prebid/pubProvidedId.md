# pubProvidedId Delivery

Delivers cached EIDs to prebid through the [`pubProvidedId` user-id submodule](https://docs.prebid.org/dev-docs/modules/userid-submodules/pubprovided.html), for integrations that deliver EIDs via user-id config rather than the RTD module.

## Usage

```js
import { mergeIntoPubProvidedId } from "@optable/web-sdk/lib/dist/core/prebid/pubProvidedId";

mergeIntoPubProvidedId({ instances: ["pbjs"] });
```

Call it after each write to the rolling EID cache (targeting, tokenize, UID2 refresh). By default it reads EIDs from the `OPTABLE_RESOLVED` key in `localStorage`; pass `cacheKey` to read another key, or `eids` to merge an explicit list.

## Behavior

- Work is queued on each instance's `que` array, so it also runs when prebid hasn't loaded yet — the queue is created on the named global if needed.
- EIDs from other providers already in `pubProvidedId` are preserved; ours are replaced by `source`.
- Duplicate `pubProvidedId` entries in an already polluted config are collapsed back to a single entry; other user-id submodules and the rest of the `userSync` config are untouched.
- Underscore-prefixed EID sidecars (`_ref` UID2 refresh material, `_id5` metadata) are stripped before EIDs reach prebid. Caches written by this SDK keep EIDs clean already (refresh material lives in the cache's `refs` sidecar), so the stripping is defensive.
- After merging, `refreshUserIds({ submoduleNames: ["pubProvidedId"] })` propagates the change — or a full `refreshUserIds()` with `refreshAll: true` (see below).
- `isControlGroup` gates delivery: while it returns true, nothing is merged. It is checked on every call, so a wrapper that merges after targeting, after tokenize and after a UID2 refresh cannot leak identifiers to a control user by forgetting one of them. Same shape as `buildRTD`'s option, so both delivery modes take the same callback.

## Options

| Option       | Default              | Description                                                                         |
| ------------ | -------------------- | ----------------------------------------------------------------------------------- |
| `instances`  | `["pbjs"]`           | Names of the prebid globals to merge into.                                          |
| `cacheKey`   | `"OPTABLE_RESOLVED"` | localStorage key of the rolling EID cache.                                          |
| `eids`       | read from the cache  | Explicit EIDs to merge, bypassing the cache.                                        |
| `refreshAll` | `false`              | Refresh every user-id submodule after merging, not just `pubProvidedId`. See below. |

## First-auction identity and `refreshAll`

Prebid versions without the fix for [prebid/Prebid.js#15562](https://github.com/prebid/Prebid.js/pull/15562) have a defect: a filtered `refreshUserIds({ submoduleNames })` issued while other ID vendors are still initializing abandons their in-flight work, so vendors like LiveIntent or ID5 are dropped from the page's first auction. The default filtered refresh this module issues at page load is exactly that trigger.

`refreshAll: true` works around it by issuing an unfiltered `refreshUserIds()` instead, which starts a full refresh cycle the auction waits for — every vendor completes, and the merged EIDs are included.

The unfiltered refresh runs on the first merge only. A wrapper merges again after tokenize and after a UID2 refresh, and repeating it would re-request every vendor each time; it exists to survive submodule initialization, which is over by then. Later merges use the filtered refresh.

- Upside: no vendor is dropped from the first auction, and split-test uplift is no longer understated by treated users losing other vendors' IDs.
- Downside: every configured ID vendor makes one fresh request on that pageview (relevant when a vendor applies per-request quotas), and the auction can start later since it waits for the slowest vendor.

Leave it off on Prebid versions that include the fix — the filtered refresh is then both correct and cheaper. Neither mode can rescue an auction that fired before the merge ran at all.
