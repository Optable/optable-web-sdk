# EID Cache Merge

Merge helpers for wrappers that keep a rolling EID cache (typically the `OPTABLE_RESOLVED` key in `localStorage`) across targeting and tokenize calls. Each response only covers the identifiers it resolved, so the cache is merged rather than overwritten.

## Usage

```js
import { mergeCache } from "@optable/web-sdk/lib/dist/core/eid-cache";

const cached = JSON.parse(localStorage.getItem("OPTABLE_RESOLVED") || "null");
const response = await sdk.targeting();

const { merged, staleUid2s } = mergeCache(response, cached, { maxUidsPerEid: 2 });
localStorage.setItem("OPTABLE_RESOLVED", JSON.stringify(merged));
```

## Merge rules

- New EIDs replace cached ones with the same `source`. A new EID without `uids` evicts the cached one: the response revoked that source.
- Cached EIDs from sources absent in the new response are carried over.
- Each EID keeps at most `maxUidsPerEid` UIDs (default 2).
- `ortb2.user.data` comes from the new response, falling back to the cached one.
- The inputs are never mutated. The merged cache is built from copies.
- Cached EIDs are wire EIDs: refresh material never sits on them, so every consumer — RTD, `pubProvidedId`, anything else — can hand them to bidding as-is, with nothing to strip.

## UID2 refresh material

Targeting responses carry UID2 refresh tokens in an opaque-keyed `refs` map, referenced from `uids[0].ext.optable.ref`. `mergeCache` validates those and stores them in the merged cache's `refs` sidecar keyed by EID `source`, dropping the `ext.optable.ref` pointer from the cached EIDs. Sources past their `refresh_from` are returned as `staleUid2s` (`{ source, ref }` pairs); pass them to the [UID2 refresh addon](../addons/uid2-refresh.md)'s `refreshStaleUid2s(config, staleUid2s)` to refresh each and apply the outcome to the cache.

A source's refs entry follows its EID: replaced when the source is re-resolved, dropped when it is evicted or the new response carries no ref for it.

Caches written by earlier bundle versions carried refresh material as `_ref` on the EID; there is no read-side fallback for that shape. Such a cache simply cannot refresh its UID2 until the next targeting response repopulates the sidecar.

## API

| Export          | Signature                                              | Description                                                          |
| --------------- | ------------------------------------------------------ | -------------------------------------------------------------------- |
| `mergeCache`    | `(newObj, oldObj, options?) => { merged, staleUid2s }` | Merge a fresh response into the cached one.                          |
| `resolveRefs`   | `(eids, refs?) => Record<string, Uid2RefData>`         | Build a source-keyed refs map from a response's opaque-keyed one.    |
| `getRefData`    | `(cache, source) => Uid2RefData \| null`               | The source's refs entry when it can drive a refresh.                 |
| `isUid2Stale`   | `(cache, source?) => boolean`                          | True when the source's ref is past `refresh_from`. Defaults to UID2. |
| `isUid2RefData` | `(value) => value is Uid2RefData`                      | Shape guard for refresh material.                                    |
