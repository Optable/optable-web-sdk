# EID Cache Merge

Merge helpers for wrappers that keep a rolling EID cache (typically the `OPTABLE_RESOLVED` key in `localStorage`) across targeting and tokenize calls. Each response only covers the identifiers it resolved, so the cache is merged rather than overwritten.

## Usage

```js
import { mergeCache, replaceCache } from "@optable/web-sdk/lib/dist/core/eid-cache";

const cached = JSON.parse(localStorage.getItem("OPTABLE_RESOLVED") || "null");
const response = await sdk.targeting();

const { merged, staleUid2s } = mergeCache(replaceCache(response), cached, { maxUidsPerEid: 2 });
localStorage.setItem("OPTABLE_RESOLVED", JSON.stringify(merged));
```

## Wire format and cache format

A targeting response off the wire keys `refs` opaquely and points at it from `uids[0].ext.optable.ref`. The cache keys `refs` by EID `source` and carries no pointers. `replaceCache` converts one to the other.

Nothing outside the cache changes: `sdk.targeting()` still resolves to the wire response, and so does the `optable-targeting:change` payload. Conversion happens where the cache is written — `setTargeting` writes through `replaceCache`, and `mergeCache` takes and returns cache format.

So anything read back out of storage is ready to merge as-is, and anything coming off the wire goes through `replaceCache` on the way in. `replaceCache` is idempotent, so calling it on a value that is already cache format is a no-op rather than a way to lose refs.

## Merge rules

- New EIDs replace cached ones with the same `source`. A new EID without `uids` evicts the cached one: the response revoked that source.
- Cached EIDs from sources absent in the new response are carried over.
- Each EID keeps at most `maxUidsPerEid` UIDs (default 2).
- `ortb2.user.data` comes from the new response, falling back to the cached one.
- The inputs are never mutated. The merged cache is built from copies.
- Cached EIDs are wire EIDs: refresh material never sits on them, so every consumer — RTD, `pubProvidedId`, anything else — can hand them to bidding as-is, with nothing to strip.

## UID2 refresh material

`replaceCache` validates the refresh material a response points at and keys it by EID `source`, dropping the `ext.optable.ref` pointers. `mergeCache` then carries those entries across merges and returns sources past their `refresh_from` as `staleUid2s` (`{ source, ref }` pairs); refresh each with the [UID2 refresh addon](../addons/uid2-refresh.md)'s `refreshUid2Token(ref.refresh_token, ref.refresh_response_key)` and apply the outcome with `applyUid2Refresh`.

A source's refs entry follows its EID: replaced when the source is re-resolved, dropped when it is evicted or the new response carries no ref for it.

Caches written by earlier wrappers carried refresh material as `_ref` on the EID, where every consumer had to strip it or leak it into bid requests. Both write paths now drop it, so a cache read back is clean and no consumer needs its own guard. There is no read-side fallback: such a cache cannot refresh its UID2 until the next targeting response repopulates the sidecar.

## API

| Export          | Signature                                              | Description                                                          |
| --------------- | ------------------------------------------------------ | -------------------------------------------------------------------- |
| `mergeCache`    | `(newObj, oldObj, options?) => { merged, staleUid2s }` | Merge a fresh response into the cached one. Both in cache format.    |
| `replaceCache`  | `(response) => response`                               | Convert a wire response to cache format. Idempotent.                 |
| `resolveRefs`   | `(eids, refs?) => Record<string, Uid2RefData>`         | Build a source-keyed refs map from a response's opaque-keyed one.    |
| `getRefData`    | `(cache, source) => Uid2RefData \| null`               | The source's refs entry when it can drive a refresh.                 |
| `isUid2Stale`   | `(cache, source?) => boolean`                          | True when the source's ref is past `refresh_from`. Defaults to UID2. |
| `isUid2RefData` | `(value) => value is Uid2RefData`                      | Shape guard for refresh material.                                    |
