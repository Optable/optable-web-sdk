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

## refreshStaleUid2s

The stale-token refresh loop over the rolling EID cache. Takes the `staleUid2s` returned by the [EID cache module](../core/eid-cache.md)'s `mergeCache` and rewrites each cached EID in place:

```js
import { mergeCache } from "@optable/web-sdk/lib/dist/core/eid-cache";
import { refreshStaleUid2s } from "@optable/web-sdk/lib/dist/addons/uid2-refresh";

const { merged, staleUid2s } = mergeCache(response, cached);
localStorage.setItem("OPTABLE_RESOLVED", JSON.stringify(merged));
refreshStaleUid2s(staleUid2s, {
  onCacheUpdated: () => mergeIntoPubProvidedId(), // only needed in ppid delivery
});
```

Options: `cacheKey` (localStorage key of the cache, default `OPTABLE_RESOLVED`), `endpoint` (forwarded to `refreshUid2Token`), and `onCacheUpdated` (called after each cache write, so a ppid-delivery wrapper can re-merge prebid's `pubProvidedId`).

Behavior per EID:

- Refresh succeeds — the cached EID's `uids` and `_ref` are replaced with the new token bundle.
- The operator rejects the refresh (expired, opted out) — the EID is removed from the cache.
- The request or decryption fails — the cache is left untouched, so a later page load can retry.

EIDs are refreshed sequentially; each iteration re-reads and rewrites the cache so writes cannot clobber each other. Verbose logging is gated on the `optableDebug` flag.
