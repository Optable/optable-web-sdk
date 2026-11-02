# UID2 Refresh Addon

Refreshes an issued UID2 token against the UID2 operator, without a round-trip to the Optable edge.

## refreshUid2Token

```js
import { refreshUid2Token } from "@optable/web-sdk/lib/dist/addons/uid2-refresh";

const result = await refreshUid2Token(refreshToken, refreshResponseKey);
if (result.status === "success") {
  // result.body: advertising_token, refresh_token, refresh_response_key,
  //              refresh_from, refresh_expires, identity_expires
}
```

POSTs the refresh token to the UID2 operator — `https://prod.uidapi.com/v2/token/refresh` by default, overridable via a third `endpoint` argument. The response is `base64(12-byte nonce || AES-GCM ciphertext)`, decrypted with the `refresh_response_key` issued alongside the refresh token.

Returns one of:

- `{ status: "success", body }` — the validated new token bundle
- `{ status: "optout" }` — the user opted out of UID2; the caller should drop the cached token
- `{ status: "error", reason, message? }` — non-OK response, unexpected operator status, or a success payload missing required fields; `reason` is the operator's status code when one was returned, `message` its free-form text

A response that cannot be decoded or decrypted throws; error policy stays with the caller.

## applyUid2Refresh

```js
import { applyUid2Refresh } from "@optable/web-sdk/lib/dist/addons/uid2-refresh";

applyUid2Refresh(config, "uidapi.com", result);
```

Applies a refresh outcome to the SDK's targeting cache. On `success`, the EID matching `source` gets its `uids` replaced with `[{ atype: 3, id: advertising_token }]` and the cache's `refs` sidecar entry for that source rewritten from the response body. On `optout`, `invalid_token` or `expired_token`, the EID and its refs entry are removed. Any other error leaves the cache untouched — the cached token stays valid until `identity_expires`, and the next page load retries. Each write is followed by the `optable-targeting:change` event so consumers mirroring the cache (e.g. a pubProvidedId merge) can re-read it. A cache without a matching EID is left untouched.

## refreshStaleUid2s

```js
import { refreshStaleUid2s } from "@optable/web-sdk/lib/dist/addons/uid2-refresh";

const { merged, staleUid2s } = mergeCache(replaceCache(response), cached);
await refreshStaleUid2s(config, staleUid2s);
```

The ready-made loop over `mergeCache`'s `staleUid2s`: refreshes each source's token against the operator and applies the outcome to the cache. Entries run sequentially, since every apply is a read-modify-write of the same cache copies. Entries without valid refresh material are skipped, failures are logged through the `optableDebug`-gated `debugLog`, and a failed entry does not stop the rest — nothing throws into the host page.

## refreshStaleUid2sFromCache

```js
import { refreshStaleUid2sFromCache } from "@optable/web-sdk/lib/dist/addons/uid2-refresh";

await refreshStaleUid2sFromCache(sdk.dcn);
```

Reads every stored copy of the targeting cache, and if any holds a UID2 past its `refresh_from`, refreshes it through `refreshStaleUid2s`. Use this on a page that served targeting from cache: only `mergeCache` produces a `staleUid2s` list, and it runs when a response is merged, so a page that never calls the edge has nothing to pass to `refreshStaleUid2s`. That is also the page where the cached token has had time to age.

Both copies are checked, the private `OPTABLE_TARGETING_<key>` one and the public `optableCacheTargeting` one, because they can differ: `identifyAndTokenize` writes its merged cache only to its own `cacheKey` (`OPTABLE_RESOLVED` by default), which is also where prebid RTD and `pubProvidedId` read from. For a tokenize-resolved UID2 to be refreshable, that key and `optableCacheTargeting` have to name the same thing. `applyUid2Refresh` then writes the outcome back to every copy.

A missing cache, an unparseable copy, a cache without refresh material, and a token not yet due are all no-ops that make no request.
