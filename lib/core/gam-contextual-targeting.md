# Contextual Targeting in GAM

Fetches the page's contextual segments and pushes the resulting key-values to Google Ad Manager, for integrations where GAM is the consumer of the classification.

## Usage

```js
import { setContextualTargetingInGAM } from "@optable/web-sdk/lib/dist/core/gam-contextual-targeting";

await setContextualTargetingInGAM(sdk, { iab_ct_3_1: "ctx_iab" });
```

Arguments after the SDK instance are optional: `taxonomyKeys` and `options` are forwarded to `ctxTargetingKeyValues()`, and a fourth `url` argument is forwarded to `ctxSegments()` for an SPA classifying a route other than the current location.

## Keys

Category ids are grouped under their taxonomy name, so a response classified under `iab_ct_3_1` produces that key unless `taxonomyKeys` renames it. Page keywords are emitted under `ctx_kw`, capped at ten and sanitized to GAM's value rules; `options.keywordKey` renames that key and an empty string opts out. See [contextual targeting key-values](../../README.md#contextual-targeting-key-values) for the full conversion rules.

## Behavior

- Nothing is queued when the page yields no key-values.
- Never rejects. Callers fire this without awaiting, and a failed classification must not stop ads from loading; a failure is logged under the `optableDebug` flag and the function returns.
- The `googletag` command queue is created if the page has not loaded GPT yet, including when a partial stub defines `googletag` without `cmd`.
- The push is skipped if `pubads()` is unavailable when the queued command runs.

## Calling it alongside `initContextual`

An SDK configured with `initContextual` already fetches the classification during initialization. This helper fetches again, since `ctxSegments()` always calls the edge. To avoid the second request, push to GAM from the `initContextual` callback instead:

```js
const sdk = new OptableSDK({
  host,
  site,
  initContextual: () => {
    const kvs = sdk.ctxTargetingKeyValues();
    // push kvs to googletag yourself
  },
});
```
