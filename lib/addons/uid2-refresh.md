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

Applies a refresh outcome to the SDK's targeting cache. On `success`, the EID matching `source` gets its `uids` replaced with `[{ atype: 3, id: advertising_token }]` and its `_ref` rewritten from the response body. On `optout` or `error`, the EID is removed. Either write is followed by the `optable-targeting:change` event so consumers (e.g. a pubProvidedId merge) can re-read the cache. A cache without a matching EID is left untouched.

The stale-token refresh loop ships separately.
