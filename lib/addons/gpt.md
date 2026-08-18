# GPT Addon

This addon extends `OptableSDK` with [Google Publisher Tag](https://developers.google.com/publisher-tag) integrations: witness logging of GPT ad events, GAM secure signals, and page-level custom targeting.

Importing the addon registers the methods on the SDK prototype, so it must be imported for its side effect before the methods are available:

```js
import OptableSDK from "@optable/web-sdk";
import "@optable/web-sdk/lib/addons/gpt";

const sdk = new OptableSDK({ host: "dcn.customer.com", site: "my-site" });
```

Every method queues its work on `googletag.cmd`, so it is safe to call before GPT has loaded. `window.googletag` is created if it does not exist yet.

## Targeting key-values

`setGPTTargeting(keyValues)` writes page-level custom targeting to GAM through `googletag.setConfig()`, which **merges** the supplied keys into existing page-level targeting rather than replacing it. It is safe to call alongside a publisher's own targeting and more than once with different keys.

```js
sdk.setGPTTargeting({ optableSignalEnrichment: "treatment,enriched,nocontext" });
sdk.setGPTTargeting({ ctx_ready: ["1"] });
```

Values may be a single string or a list of strings. Calling it with `{}` or `undefined` is a no-op and does not touch `googletag.cmd`.

## Contextual targeting

`setGPTContextualTargeting(taxonomyKeys?, options?)` pushes the contextual key-values for the current page to GAM via `pubads().setTargeting()`. Both arguments are forwarded to [`ctxTargetingKeyValues()`](../../README.md#contextual-targeting-key-values) unchanged.

This method **reads the contextual response already cached on the SDK instance and does not fetch**. Drive it from the `initContextual` callback so the response is present and only one request is made:

```js
const sdk = new OptableSDK({
  host: "dcn.customer.com",
  site: "my-site",
  initContextual: () => sdk.setGPTContextualTargeting(),
});
```

Or call it after awaiting `ctxSegments()` yourself:

```js
await sdk.ctxSegments();
sdk.setGPTContextualTargeting();
```

Filter and rename taxonomies, and opt out of keyword emission, using the same arguments `ctxTargetingKeyValues()` accepts:

```js
sdk.setGPTContextualTargeting({ iab_ct_3_1: "ctx_cat" }, { keywordKey: "ctx_kw", maxKeywords: 5 });
```

If no contextual response has been fetched, or it produces no key-values, the call is a no-op.

## Secure signals

`installGPTSecureSignals(...signals)` registers pre-built `{ provider, id }` pairs as [GAM secure signals](https://support.google.com/admanager/answer/10488752):

```js
sdk.installGPTSecureSignals({ provider: "uidapi.com", id: advertisingToken });
```

`installGPTSecureSignalsFromEIDs(eids, filter?)` derives those pairs from a list of ORTB2 EIDs, so you can hand it a targeting response directly:

```js
const resolved = sdk.targetingFromCache();
sdk.installGPTSecureSignalsFromEIDs(resolved?.ortb2?.user?.eids ?? [], {
  sources: ["uidapi.com"],
});
```

**Filtering.** Each of `sources`, `inserters` and `matchers` is an allow-list applied to the corresponding EID field. An omitted or empty list places no constraint on that field, matching the `matcherFilter` convention in the RTD module — so passing no filter at all emits every EID that has a usable uid.

```js
// Only Optable-inserted UID2 tokens:
sdk.installGPTSecureSignalsFromEIDs(eids, {
  sources: ["uidapi.com"],
  inserters: ["optable.co"],
});
```

**Registration is once per provider per page load.** GPT registers one collector function per provider id, so a second call naming a provider that has already been registered is ignored, including when the underlying id has since changed (for example after a UID2 token refresh). The first uid of each matching EID is the one registered.

## Ad event logging

`installGPTEventListeners(eventSpec?)` listens for GPT ad events and sends them to the DCN via the witness API. With no argument it registers `slotRenderEnded` and `impressionViewable` and sends all available properties:

```js
sdk.installGPTEventListeners();
```

Pass an event spec to choose events and limit the witness properties sent per event. Use `"all"` for the full property set:

```js
sdk.installGPTEventListeners({
  impressionViewable: ["slot_element_id", "is_empty"],
  slotRenderEnded: "all",
});
```

Repeat calls are a no-op, so listeners are never registered twice.

## API

| Method                                               | Returns | Description                                                                        |
| ---------------------------------------------------- | ------- | ---------------------------------------------------------------------------------- |
| `setGPTTargeting(keyValues)`                         | `void`  | Merges page-level custom targeting into GAM via `setConfig()`.                     |
| `setGPTContextualTargeting(taxonomyKeys?, options?)` | `void`  | Pushes cached contextual key-values via `pubads().setTargeting()`. Does not fetch. |
| `installGPTSecureSignalsFromEIDs(eids, filter?)`     | `void`  | Derives secure signals from ORTB2 EIDs and registers them, once per provider.      |
| `installGPTSecureSignals(...signals)`                | `void`  | Registers pre-built `{ provider, id }` secure signals.                             |
| `installGPTEventListeners(eventSpec?)`               | `void`  | Sends GPT ad events to the DCN via witness. Idempotent.                            |

### `SecureSignalsFilter`

| Option      | Type       | Default | Description                                                                |
| ----------- | ---------- | ------- | -------------------------------------------------------------------------- |
| `sources`   | `string[]` | —       | Allow-list of EID `source` values. Omitted or empty means no constraint.   |
| `inserters` | `string[]` | —       | Allow-list of EID `inserter` values. Omitted or empty means no constraint. |
| `matchers`  | `string[]` | —       | Allow-list of EID `matcher` values. Omitted or empty means no constraint.  |

## Full example

Resolving targeting, then setting contextual targeting, secure signals and a reporting key-value:

```js
import OptableSDK from "@optable/web-sdk";
import "@optable/web-sdk/lib/addons/gpt";

const sdk = new OptableSDK({
  host: "dcn.customer.com",
  site: "my-site",
  initContextual: () => sdk.setGPTContextualTargeting(),
});

sdk.installGPTEventListeners();

const targeting = await sdk.targeting();
const eids = targeting?.ortb2?.user?.eids ?? [];

sdk.installGPTSecureSignalsFromEIDs(eids, { sources: ["uidapi.com"] });
sdk.setGPTTargeting({ optableEnriched: eids.length > 0 ? "enriched" : "empty" });
```
