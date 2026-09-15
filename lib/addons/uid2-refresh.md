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

While a `refreshUid2Token` call is in flight, targeting calls hold off (up to 2s, so a hung refresh cannot block targeting for the page), keeping a targeting response from interleaving with the refresh and pairing a fresh EID with a stale outcome. `refreshUid2Token` only covers its own operator round-trip; an orchestrator that does other async work between refreshing and applying should wrap the whole sequence with `trackUid2Refresh` from `core/uid2-refresh-lock` so the cache write is covered too:

```js
import { trackUid2Refresh } from "@optable/web-sdk/lib/dist/core/uid2-refresh-lock";

await trackUid2Refresh(async () => {
  const result = await refreshUid2Token(ref.refresh_token, ref.refresh_response_key);
  applyUid2Refresh(config, source, result);
});
```

A targeting call already in flight when the refresh starts can still overwrite the refresh outcome when its response lands — that ordering predates the lock, and the next merge cycle repairs it.

The stale-token refresh loop ships separately.
