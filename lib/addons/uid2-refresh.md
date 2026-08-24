# UID2 Refresh Addon

Refreshes an issued UID2 token against the UID2 operator, without a round-trip to the Optable edge.

## refreshUid2Token

```js
import { refreshUid2Token } from "@optable/web-sdk/lib/dist/addons/uid2-refresh";

const body = await refreshUid2Token(refreshToken, refreshResponseKey);
```

POSTs the refresh token to `https://prod.uidapi.com/v2/token/refresh`. The response is `base64(12-byte nonce || AES-GCM ciphertext)`, decrypted with the `refresh_response_key` issued alongside the refresh token.

Returns the decrypted body — `advertising_token`, `refresh_token`, `refresh_response_key`, `refresh_from`, `refresh_expires`, `identity_expires` — or `null` when the operator rejects the request, the user has opted out, or the response carries no `advertising_token`. A malformed response throws; error policy stays with the caller.

Cache updates and the stale-token refresh loop ship separately.
