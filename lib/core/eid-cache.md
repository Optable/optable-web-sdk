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

`sdk.targeting()` still resolves to the wire response. The `optable-targeting:change` payload reports the cache instead, so its `ortb2.user.eids` carry no `ext.optable.ref` pointers; the event has never carried `refs`, so there was nothing to resolve them against. Conversion happens where the cache is written — `setTargeting` writes through `replaceCache`, and `mergeCache` takes and returns cache format.

`setTargeting` merges rather than replaces. It stores the incoming response as sent, with `ortb2.user.eids` and `refs` taken from `mergeCache` against what is already cached, so a session whose edge resolved fewer matchers keeps the sources it already held. Only the EID subset carries over; `audience`, `user` and every other field come from the new response alone.

The merged EID list is written whenever either side lists `eids`, so a response that lists none still picks up the cached ones, and a response revoking every cached source stores an empty list. Only when neither side lists `eids` is the response stored exactly as sent. The merge runs with no UID cap, since the cap belongs to whoever produced the response.

Carry-over is scoped to one identity. `setTargeting` stores the passport's visitor id and a digest per request id and hid in a `<key>:id` sibling, and replaces instead of merging when the visitor id differs, or when each side holds an id the other lacks. Adding or dropping ids for the same visitor still merges, so signing in or out mid-session does not clear the cache.

`__passport__` is not counted as an id. It names the browser, which the visitor field already identifies, and counting it would make `sdk.targeting()` and `sdk.targeting("e:x")` look like disjoint sets: the default request sends `__passport__` alone and the string form sends the id alone, so signing in would replace the cache rather than merge onto it.

A merge stores the union of the cached ids and the new ones, not just the new ones. Without that, signing in as A, signing out, then signing in as B reads as two separately allowed steps, because the signed-out write would narrow the stored identity to nothing for the next comparison to contradict. The union keeps A's id in the fingerprint, so B's request contradicts it and replaces.

The merge runs against every stored copy, not only the private one. `identifyAndTokenize` writes its result to the public key alone, so a source it added lives only there and merging against the private copy would drop it on the next targeting write.

Two caveats follow from that. A request carrying only `__passport__` identifies the browser, not the person, so two people sharing a signed-out browser share EIDs. And nothing bounds how long a carried EID survives: a source stays in the cache until the identity changes or the edge sends that source back with an empty `uids` list, so a matcher turned off on the node keeps feeding bidders until then. A max age per source would cover it and is not implemented.

`Targeting` reports what was stored rather than the response it sent, so the `optable-targeting:change` payload and the cache agree. Without that, `resolved` reads false and `ortb2` omits the carried sources whenever a response carries no EIDs of its own.

Callers pass `{ merge: false }` when the request changed which matchers ran. `Targeting` does this for an A/B arm carrying `skipMatchers`, `skipResolvers` or `matcher_override`: that arm resolved a deliberately smaller set, and carrying cached EIDs forward would put back exactly what it left out. An arm that only buckets traffic still merges.

So anything read back out of storage is ready to merge as-is, and anything coming off the wire goes through `replaceCache` on the way in. `replaceCache` is idempotent, so calling it on a value that is already cache format is a no-op rather than a way to lose refs.

## Merge rules

- New EIDs replace cached ones with the same `source`. A new EID without `uids` evicts the cached one: the response revoked that source.
- Cached EIDs from sources absent in the new response are carried over.
- Each EID keeps at most `maxUidsPerEid` UIDs (default 2). `setTargeting` passes `Infinity`.
- `ortb2.user.data` comes from the new response, falling back to the cached one.
- A source's `refs` entry comes from the response that re-sent it, or from the cache when it was carried over. `setTargeting` re-derives these rather than taking `mergeCache`'s, which keeps UID2 entries only.
- The inputs are never mutated. The merged cache is built from copies.

## Non-overriding matchers

`nonOverridingMatchers` lists matcher values that lose a contested source. An EID whose `eid.matcher` is listed will not displace one already cached on that source from a matcher that is not, revocation included: a listed matcher sending the source with no uids leaves the cached EID alone. Anything else still wins, so a call keeps refreshing and revoking its own entries, and the kept EID keeps its refs. An EID with no matcher is never listed, so it always wins.

```typescript
const { merged } = mergeCache(replaceCache(response), cached, { nonOverridingMatchers: ["acme.com"] });
```

Listing a publisher's own domains is what lets a targeting call resolved with `skip_matchers: ["1p"]` run alongside a tokenize call: the two fill the same sources, and whichever lands second no longer overwrites the other. The decision is made on the label rather than on arrival order, so the calls can go out in parallel instead of tokenize waiting for targeting to come back empty. Leave it unset and every new EID wins its source, as before.

- Cached EIDs are wire EIDs: refresh material never sits on them, so every consumer — RTD, `pubProvidedId`, anything else — can hand them to bidding as-is, with nothing to strip.

## UID2 refresh material

`replaceCache` validates the refresh material a response points at and keys it by EID `source`, dropping the `ext.optable.ref` pointers. `mergeCache` then carries those entries across merges and returns sources past their `refresh_from` as `staleUid2s` (`{ source, ref }` pairs); pass them to the [UID2 refresh addon](../addons/uid2-refresh.md)'s `refreshStaleUid2s(config, staleUid2s)` to refresh each and apply the outcome to the cache. On a page that merges no response, there is no such list; the addon's `refreshStaleUid2sFromCache(config)` reads the stored cache instead and refreshes what it finds.

A source's refs entry follows its EID: replaced when the source is re-resolved, dropped when it is evicted or the new response carries no ref for it.

Caches written by earlier wrappers carried refresh material as `_ref` on the EID, where every consumer had to strip it or leak it into bid requests. Both write paths drop it, so a cache this SDK has written is clean. Consumers still apply `withoutLegacyRef` on read, since the first merge of a pageview can run against a cache written before the upgrade. There is no read-side fallback: such a cache cannot refresh its UID2 until the next targeting response repopulates the sidecar.

## API

| Export          | Signature                                              | Description                                                          |
| --------------- | ------------------------------------------------------ | -------------------------------------------------------------------- |
| `mergeCache`    | `(newObj, oldObj, options?) => { merged, staleUid2s }` | Merge a fresh response into the cached one. Both in cache format.    |
| `replaceCache`  | `(response) => response`                               | Convert a wire response to cache format. Idempotent.                 |
| `resolveRefs`   | `(eids, refs?) => Record<string, Uid2RefData>`         | Build a source-keyed refs map from a response's opaque-keyed one.    |
| `getRefData`    | `(cache, source) => Uid2RefData \| null`               | The source's refs entry when it can drive a refresh.                 |
| `isUid2Stale`   | `(cache, source?) => boolean`                          | True when the source's ref is past `refresh_from`. Defaults to UID2. |
| `isUid2RefData` | `(value) => value is Uid2RefData`                      | Shape guard for refresh material.                                    |
| `UID2_SOURCE`   | `"uidapi.com"`                                         | The EID source UID2 refresh material is keyed under.                 |
