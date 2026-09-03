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
- The inputs are never mutated. The merged cache is built from copies, so a targeting response that is also fed to bidding never picks up `_ref` refresh material or truncated `uids`.

## UID2 refresh material

Targeting responses carry UID2 refresh tokens in a `refs` map, referenced from `uids[0].ext.optable.ref`. `mergeCache` validates and resolves those onto each merged EID as `_ref`, and returns UID2 EIDs past their `refresh_from` as `staleUid2s`. Pass them to the [UID2 refresh addon](../addons/uid2-refresh.md)'s `refreshStaleUid2s(config, staleUid2s)` to refresh each in place.

`_ref` is cache-only metadata: the RTD module strips it before EIDs reach bid requests.

## API

| Export        | Signature                                              | Description                                                   |
| ------------- | ------------------------------------------------------ | ------------------------------------------------------------- |
| `mergeCache`  | `(newObj, oldObj, options?) => { merged, staleUid2s }` | Merge a fresh response into the cached one.                   |
| `resolveRefs` | `(eids, refs?) => void`                                | Stamp validated `refs` entries onto EIDs as `_ref`, in place. |
| `getRefData`  | `(eid) => Uid2RefData \| null`                         | The EID's `_ref` when it can drive a refresh.                 |
| `isUid2Stale` | `(eid) => boolean`                                     | True when the EID's ref is past `refresh_from`.               |
