# GPT Addon

Everything in the SDK that talks to Google Publisher Tag. Importing the addon augments `OptableSDK` with the two `install*` methods and exports `setContextualTargetingInGAM`.

```js
import "@optable/web-sdk/lib/dist/addons/gpt";
```

## installGPTEventListeners

Subscribes to GPT's `slotRenderEnded` and `impressionViewable` events and witnesses each one to the DCN. Pass an event spec to choose events or narrow the properties sent. Failures are swallowed so a GPT quirk cannot break the host page.

## installGPTSecureSignals

Registers `{ provider, id }` pairs with GAM [Secure Signals](https://support.google.com/admanager/answer/10488752). Build the pairs from cached EIDs with `secureSignalsFromEids` from `core/secure-signals`.

## setContextualTargetingInGAM

Fetches the page's contextual segments and pushes the resulting key-values to GAM, for integrations where GAM consumes the classification.

```js
import { setContextualTargetingInGAM } from "@optable/web-sdk/lib/dist/addons/gpt";

await setContextualTargetingInGAM(sdk, { iab_ct_3_1: "ctx_iab" });
```

Arguments after the SDK instance are optional. `taxonomyKeys` and `options` are forwarded to `ctxTargetingKeyValues()`, and a fourth `url` is forwarded to `ctxSegments()` for an SPA classifying a route other than the current location.

### Keys

Category ids are grouped under their taxonomy name, so a response classified under `iab_ct_3_1` produces that key unless `taxonomyKeys` renames it. Page keywords are emitted under `ctx_kw`, capped at ten and sanitized to GAM's value rules; `options.keywordKey` renames that key and an empty string opts out. See [contextual targeting key-values](../../README.md#contextual-targeting-key-values) for the full conversion rules.

### Behaviour

- Nothing is queued when the page yields no key-values.
- Never rejects. Callers fire this without awaiting, and a failed classification must not stop ads from loading; the failure is logged under the `optableDebug` flag and the function returns.
- The `googletag` command queue is created if the page has not loaded GPT yet, including when a partial stub defines `googletag` without `cmd`.
- The push is skipped if `pubads()` is unavailable when the queued command runs.

### Calling it alongside `initContextual`

An SDK configured with `initContextual` already fetches the classification during initialization, and `ctxSegments()` always calls the edge, so this helper fetches a second time. To avoid that, push to GAM from the `initContextual` callback instead and convert with `ctxTargetingKeyValues()` directly.
