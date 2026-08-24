# Optable Web SDK [![Continuous Integration](https://github.com/Optable/optable-web-sdk/actions/workflows/pull-request.yml/badge.svg)](https://github.com/Optable/optable-web-sdk/actions/workflows/pull-request.yml) <!-- omit in toc -->

JavaScript SDK for integrating with an [Optable Data Connectivity Node (DCN)](https://docs.optable.co/) from a web site or web application.

## Contents <!-- omit in toc -->

- [Installing](#installing)
  - [NPM module](#npm-module)
  - [Script tag](#script-tag)
- [Versioning](#versioning)
- [Domains and Cookies](#domains-and-cookies)
  - [LocalStorage](#localstorage)
- [Using the NPM module](#using-the-npm-module)
- [Initialization Configuration (`InitConfig`)](#initialization-configuration-initconfig)
  - [Required Keys](#required-keys)
  - [Optional Keys](#optional-keys)
- [Usage Example](#usage-example)
  - [Security \& Privacy](#security--privacy)
  - [Identify API](#identify-api)
  - [Profile API](#profile-api)
  - [Targeting API](#targeting-api)
    - [Single Identifier (Default)](#single-identifier-default)
    - [Multiple Identifiers](#multiple-identifiers)
    - [TypeScript Types](#typescript-types)
    - [Caching Targeting Data](#caching-targeting-data)
  - [Witness API](#witness-api)
    - [Contextual Pageview Tracking](#contextual-pageview-tracking)
    - [Contextual Segments API](#contextual-segments-api)
      - [Contextual targeting key-values](#contextual-targeting-key-values)
- [Using a script tag](#using-a-script-tag)
  - [Option 1: Automatic Initialization](#option-1-automatic-initialization)
  - [Option 2: Manual Initialization with Commands Queue](#option-2-manual-initialization-with-commands-queue)
- [Integrating PrebidJS analytics](#integrating-prebidjs-analytics)
  - [Script tag](#script-tag-1)
  - [NPM package](#npm-package)
- [Integrating GAM360](#integrating-gam360)
  - [Targeting key values](#targeting-key-values)
  - [Targeting key values from local cache](#targeting-key-values-from-local-cache)
  - [Witnessing ad events](#witnessing-ad-events)
  - [GAM Secure Signals](#gam-secure-signals)
- [Integrating Prebid](#integrating-prebid)
  - [Open Pair ID Prebid Module](#open-pair-id-prebid-module)
  - [Seller Defined Audiences](#seller-defined-audiences)
  - [Custom key values](#custom-key-values)
- [Identifying visitors arriving from Email newsletters](#identifying-visitors-arriving-from-email-newsletters)
  - [Insert oeid into your Email newsletter template](#insert-oeid-into-your-email-newsletter-template)
  - [Call tryIdentifyFromParams SDK API](#call-tryidentifyfromparams-sdk-api)
- [Passport and Visitor ID](#passport-and-visitor-id)
- [Optable Identity System (OIS)](#optable-identity-system-ois)
  - [Enabling OIS](#enabling-ois)
  - [Reading the OIS ID](#reading-the-ois-id)
  - [How the ID is stored and replayed](#how-the-id-is-stored-and-replayed)
  - [Which transport is in use](#which-transport-is-in-use)
- [QA and debug flags](#qa-and-debug-flags)
- [Multi-Node Targeting Resolver](#multi-node-targeting-resolver)
  - [Usage](#usage)
  - [Rules](#rules)
  - [Return Value](#return-value)
  - [Input Type](#input-type)
- [Geo-routing](#geo-routing)
- [Bot detection](#bot-detection)
- [Demo Pages](#demo-pages)

## Installing

The [Optable](https://optable.co/) web SDK can be installed as a ES6 compatible [npm](https://www.npmjs.com/) module using package managers such as [pnpm](https://pnpm.io/), paired with module bundlers such as [webpack](https://webpack.js.org/) or [browserify](http://browserify.org/), or can be loaded on a webpage directly by referencing a release build from the page HTML via a `<script>` tag.

> :warning: **CORS Configuration**: Regardless of how you install the SDK, make sure that the _Allowed HTTP Origins_ setting in the Optable DCN that you are integrating with contains the URL(s) of any web site(s) where the SDK is being used, otherwise your browser may block communication with the DCN.

### NPM module

If you're building a web application or want to bundle the SDK functionality with your own JavaScript, then using a package manager like [pnpm](https://pnpm.io/) or [npm](https://www.npmjs.com/) is the recommended installation method. It pairs nicely with module bundlers such as [webpack](https://webpack.js.org/) or [browserify](http://browserify.org/) and exports types for applications using the [typescript](https://www.typescriptlang.org/) language and type checker. To use it simply install the package:

```shell
# latest stable release (using pnpm):
pnpm install @optable/web-sdk

# or using npm:
npm install @optable/web-sdk
```

And then simply `import` and use the `OptableSDK` class as shown in the _Usage_ section below.

### Script tag

For simple integrations from your web site, you can load the SDK built for the browser from Optable's CDN via a HTML `script` tag. In production it's advised to lock your SDK bundle to a specific major version identified by `vX` or a specific minor version with `vX.Y`, while in development you may want to experiment with `latest`.

E.g. in development use the following in the `<head>` block of your HTML page:

```html
<!-- Latest version for development -->
<script async src="https://cdn.optable.co/web-sdk/latest/sdk.js"></script>
```

Or in production:

```html
<!-- v0 in production -->
<script async src="https://cdn.optable.co/web-sdk/v0/sdk.js"></script>
```

Note the presence of the `async` attribute, which instructs browsers to load the library asynchronously and not block the page from rendering.

## Versioning

The SDK follows [Semantic Versioning](https://semver.org/) conventions.
You can therefore expect that there will not be any breaking API changes if you are tracking a particular major version.

## Domains and Cookies

By default, the [Optable](https://optable.co/) SDK makes use of a secure HTTP-only _first-party_ browser cookie in order to anonymously identify browsers via a _visitor ID_, within the context of any web sites sharing an _effective top-level domain plus one_ (eTLD+1) with the configured DCN host.

For example, if your website runs at `www.customer.com` or `customer.com`, then ideally your DCN will be configured to run at `dcn.customer.com`, and will read/write a first-party cookie at `customer.com`. The contents of the cookie will not be accessible to any third-party scripts. Finally, the cookie will have the `SameSite=Lax`attribute so that it is available on the first visit.

> :warning: **Optable Visitor ID Scope**: The _visitor ID_ configured by the Optable DCN will be unique to a browser only within the top-level domain that the DCN shares with the calling web site.

### LocalStorage

In cases where it is not practical or possible to configure your DCN to run on the same effective top-level domain plus one (eTLD+1) as your website(s), then the default cookie-based transport that the SDK depends on will not work. Instead, you can configure the SDK to use browser `LocalStorage`. To switch to the `LocalStorage` based configuration, simply set the optional `cookies` parameter to `false` when creating your SDK instance. For example:

```javascript
import OptableSDK from "@optable/web-sdk";

const sdk = new OptableSDK({ host: "dcn.customer.com", site: "my-site", cookies: false });
```

Note that the default is `cookies: true` and will be inferred if you do not specify the `cookies` parameter at all.

## Using the NPM module

## Initialization Configuration (`InitConfig`)

When creating an instance of `OptableSDK`, you can pass an `InitConfig` object to customize its behavior. Below are the available configuration keys and their descriptions:

### Required Keys

- **`site` (string)**
  The identifier (slug) of Javascript SDK source. This must match a configured site in the [Optable](https://optable.co/) DCN. Must have properly configure `Allowed HTTP Origins`.

- **`host` (string)**
  The hostname of the Optable DCN to which the SDK will connect. All API requests will be directed here.

### Optional Keys

- **`node` (string)**
  If supported by the DCN host, specify the API node for SDK requests. Used in multi-node environments.

- **`cookies` (boolean, default: `true`)**
  If `true`, enables the use of browser cookies for storage.

- **`initPassport` (boolean, default: `true`)**
  If `true`, initializes the user passport (identity mechanism) upon SDK load.

- **`initTargeting` (boolean, default: `false`)**
  If `true`, the SDK will automatically perform a targeting request during initialization and store the response in cache. This ensures the cache is populated with the most up-to-date targeting data as soon as the SDK is loaded.

- **`pageContext` (`PageContextConfig | boolean`, default: `undefined`)**
  When set, enables page context extraction for contextual intelligence. Set to `true` to use defaults, or pass a `PageContextConfig` object to customize what is extracted (HTML content, content selector, max lengths). Extracted context is automatically attached to the first `witness()` call that uses `{ includeContext: true }`.

- **`initContextual` (`boolean | (response: ContextualSegmentsResponse) => void`, default: `false`)**
  If `true`, the SDK will automatically fire a `pageview` witness event with full page context during initialization, and also call `ctxSegments()` to fetch contextual segments for the current page, caching the result on the instance for later use via `ctxTargetingKeyValues()`. This is the recommended way to enable contextual pageview tracking and contextual targeting without writing custom code. Implies `pageContext: true` when no `pageContext` is explicitly configured.
  When set to a callback function, the SDK does everything `true` does **and** invokes the callback with the `ContextualSegmentsResponse` once it resolves — useful for chaining an ad-server load (e.g. GAM) on the contextual response without making a second `ctxSegments()` call. The callback is not invoked if the request fails.

- **`consent` (`InitConsent`)**
  Defines the consent settings for data collection and processing.

- **`readOnly` (boolean, default: `false`)**
  When set to `true`, puts the SDK in a read-only mode, preventing any data modifications while still allowing API queries.

- **`optableCacheTargeting` (string, defaults: `optable-cache:targeting`)**
  Local storage cache key used to store latest targeting response.

- **`forwardSignals` (boolean, default: `false`)**
  When set to `true`, forwards soft device/browser signals (language, timezone, screen size, device memory, CPU cores) to the DCN in a `sig` request parameter. Also requires device access consent, so it is a no-op when consent is not granted. A signal the browser does not expose is omitted rather than sent empty.

- **`ois` (boolean, default: `false`)**
  When set to `true`, participates in the [Optable Identity System](#optable-identity-system-ois): the SDK persists the OIS ID the DCN reports and replays it on subsequent requests, so the browser keeps one identity where the third-party `OPTABLE_OID` cookie is unavailable. Requires an OIS-enabled DCN node and device access consent, so it is a no-op otherwise.

These configurations allow fine-tuned control over how the `OptableSDK` interacts with the Optable DCN, ensuring compatibility with different environments and privacy settings.

## Usage Example

To configure an instance of `OptableSDK` integrating with an Optable DCN running at hostname `dcn.customer.com`, from a configured web site origin identified by slug `my-site`, you simply create an instance of the `OptableSDK` class exported by the `@optable/web-sdk` module:

```javascript
import OptableSDK from "@optable/web-sdk";

const sdk = new OptableSDK({ host: "dcn.customer.com", site: "my-site" });
```

You can then call various SDK APIs on the instance as shown in the examples below. It is also possible to configure multiple instances of `OptableSDK` in order to connect to different DCNs or reference multiple site slugs.

### Security & Privacy

- All SDK communication with Optable DCNs is done over TLS to ensure data security.
- The `consent` option allows compliance with privacy regulations by defining explicit data collection settings.

### Identify API

To associate a user's browser with an authenticated identifier such as an Email address, optionally linked with other identifiers, such as your own vendor, publisher, or site-level `PPID`, you can call the `identify` API as follows:

```javascript
const onSuccess = () => console.log("Identify API success!");
const onFailure = (err) => console.warn("Identify API error: ${err.message}");

const emailID = OptableSDK.eid("some.email@address.com");

// Identify with Email ID (eid):
sdk.identify(emailID).then(onSuccess).catch(onFailure);

// You can optionally link it with your own PPID in the same DCN identification call,
// simply pass a second argument to identify(). A custom PPID value can be sent to identify()
// after it is prepared with the OptableSDK.cid() helper:
const ppid = OptableSDK.cid("some.ppid");
sdk.identify(emailID, ppid).then(onSuccess).catch(onFailure);
```

The `identify()` method will asynchronously connect to the configured DCN and send IDs for resolution.

> :warning: **Client-Side Email Hashing**: The `OptableSDK.eid()` helper will compute the SHA-256 hash of the Email address on the client-side and send the hashed value to the DCN. The Email address is **not** sent by the browser in plain text.

The frequency of invocation of `identify` is up to you, however for optimal identity resolution we recommended to call the `identify()` method on your `OptableSDK` instance on each page load while the user is authenticated, or periodically such as for example once every 15 to 60 minutes while the user is authenticated and actively using your site.

### Profile API

To associate key value traits with a user's browser, for eventual audience assembly, you can call the profile API as follows:

```javascript
const onSuccess = () => console.log("Profile API success!");
const onFailure = (err) => console.warn("Profile API error: ${err.message}");

const visitorTraits = {
  gender: "M",
  age: 44,
  favColor: "blue",
  hasAccount: true,
};

sdk.profile(visitorTraits).then(onSuccess).catch(onFailure);
```

The specified visitor traits are associated with the user's browser and can be matched during audience assembly.

Note that visitor traits are key value pairs and have type `ProfileTraits`:

```typescript
type ProfileTraits = {
  [key: string]: string | number | boolean;
};
```

You can also override the main identifier (replacing the Optable Visitor ID) as the second argument of the function.
The third argument is to provide additional identifier(s) that you want to associate to that profile.

```javascript
const onSuccess = () => console.log("Profile API success!");
const onFailure = (err) => console.warn("Profile API error: ${err.message}");

const visitorTraits = {
  gender: "M",
  age: 44,
  favColor: "blue",
  hasAccount: true,
};

const emailID = OptableSDK.eid("some.email@address.com");
const additionalIDs = [];
additionalIDs.push(OptableSDK.cid("id1"));
additionalIDs.push(OptableSDK.cid("id2", "c2"));

sdk.profile(visitorTraits, emailID, additionalIDs).then(onSuccess).catch(onFailure);
```

### Targeting API

To get the targeting information associated by the configured DCN with the user's browser in real-time, you can call the targeting API as follows:

```javascript
sdk
  .targeting()
  .then((response) => {
    console.log(`Audience targeting: ${targeting.audience}`);
    console.log(`User targeting: ${targeting.user}`);
  })
  .catch((err) => console.warn(`Targeting API Error: ${err.message}`));
```

The `targeting()` function accepts different parameter formats:

#### Single Identifier (Default)

```javascript
// Uses the default passport identifier
sdk.targeting();

// Uses a specific identifier
sdk.targeting("some_identifier");
```

#### Multiple Identifiers

To target multiple identifiers, use the object parameter format:

```javascript
// Target multiple identifiers
sdk
  .targeting({ ids: ["identifier1", "identifier2", "identifier3"] })
  .then((response) => {
    console.log(`Multi-targeting response: ${response}`);
  })
  .catch((err) => console.warn(`Targeting API Error: ${err.message}`));
```

#### TypeScript Types

The targeting function accepts the following parameter types:

```typescript
type TargetingRequest = string | { ids?: string[] };

// Examples:
sdk.targeting(); // Uses default "__passport__"
sdk.targeting("some_id"); // Single identifier
sdk.targeting({ ids: ["id1", "id2"] }); // Multiple identifiers
```

On success, the resulting targeting data is typically sent as part of a subsequent ad call. Therefore we recommend that you either call targeting() before each ad call, or in parallel periodically, caching the resulting targeting data which you then provide in ad calls.

#### Caching Targeting Data

The `targeting` API will automatically cache resulting key value data in client storage on success. You can subsequently retrieve the cached key value data as follows:

```javascript
const cachedTargetingData = sdk.targetingFromCache();
if (cachedTargetingData) {
  console.log(`Audience targeting: ${cachedTargetingData.audience}`);
  console.log(`User targeting: ${cachedTargetingData.user}`);
}
```

You can also clear the locally cached targeting data:

```javascript
sdk.targetingClearCache();
```

Note that both `targetingFromCache()` and `targetingClearCache()` are synchronous.

### Witness API

To send real-time event data from the user's browser to the DCN for eventual audience assembly, you can call the witness API as follows:

```javascript
const onSuccess = () => console.log("Witness API success!");
const onFailure = (err) => console.warn("Witness API error: ${err.message}");

const eventProperties = {
  property_one: "some_value",
  property_two: 123,
  property_three: false,
};

sdk.witness("event_type_here", eventProperties).then(onSuccess).catch(onFailure);
```

The specified event type and properties are associated with the logged event and which can be used for matching during audience assembly.

Note that event properties are key value pairs and have type `WitnessProperties`:

```typescript
type WitnessProperties = {
  [key: string]: string | number | boolean;
};
```

### Contextual Pageview Tracking

The SDK can automatically fire a `pageview` witness event with full page context on initialization. This sends semantic content from the page (title, description, keywords, headings, canonical URL, Open Graph tags, and body text) to the DCN for contextual audience assembly.

#### Option 1: Automatic (recommended)

Set `initContextual: true` in your SDK config. The SDK fires the pageview event once after passport initialization, with no additional code required:

```javascript
const sdk = new OptableSDK({
  host: "dcn.customer.com",
  site: "my-site",
  initContextual: true,
});
```

You can combine this with `pageContext` to customize what content is extracted:

```javascript
const sdk = new OptableSDK({
  host: "dcn.customer.com",
  site: "my-site",
  initContextual: true,
  pageContext: {
    contentSelector: "article",
    maxContentLength: 3000,
  },
});
```

#### Option 2: Manual

Enable `pageContext` in your config and call `witness()` with `{ includeContext: true }` yourself. Context is attached once per page load (subsequent calls with `includeContext: true` send no context):

```javascript
const sdk = new OptableSDK({
  host: "dcn.customer.com",
  site: "my-site",
  pageContext: true,
});

// Fire a pageview with URL property and full page context attached
const url = `${window.location.hostname}${window.location.pathname}`;
sdk.witness("pageview", { url }, { includeContext: true });
```

To reset the context (e.g. on SPA navigation), call `sdk.resetContext()` before the next `witness()` call.

### Contextual Segments API

In addition to pageview tracking, the SDK can classify a page URL against one or more contextual taxonomies (such as the [IAB Content Taxonomy](https://iabtechlab.com/standards/content-taxonomy/)) and use the result for ad targeting. Call `ctxSegments()` to fetch the contextual classifications for a URL:

```javascript
// Classify the current page (defaults to window.location.href):
const response = await sdk.ctxSegments();

// Or classify an explicit URL:
const response = await sdk.ctxSegments("https://example.com/article");
```

The response has the shape:

```typescript
type ContextualSegmentsResponse = {
  classifications: {
    categories: { id: string; name: string; score: number; taxonomy: string }[];
    keywords: { keyword: string; prominence: number }[];
  };
};
```

`classifications` groups results by classification method; the DCN populates only the methods it has enabled. `categories` are taxonomy classifications (each carrying its own `taxonomy`); `keywords` are free-form terms extracted from the page. A category's `score` is a relevance score from 0 to 1, whereas a keyword's `prominence` is a per-page ordinal rank (1 = most prominent), not a comparable score.

Each call to `ctxSegments()` caches its response on the SDK instance (calling it again refreshes the cache). When `initContextual: true`, the SDK calls `ctxSegments()` for you during initialization, so the cache is populated automatically.

> **Note:** The requested URL must already have been classified by the DCN. If the DCN has no classification for the URL, the response will contain empty `categories` and `keywords` arrays.

#### Contextual targeting key-values

`ctxTargetingKeyValues(taxonomyKeys?, options?)` reads the cached `ctxSegments()` response and builds a `Record<string, string[]>`, ready to pass to an ad server such as Google Ad Manager via `googletag.pubads().setTargeting()`. It emits category ids grouped by taxonomy, plus, by default, the page's keywords under the key `ctx_kw`:

```javascript
sdk.ctxTargetingKeyValues();
// => {
//   "iab_ct_3_1": ["53", "91", "58", "115", "90", "52"],
//   "ctx_kw": ["advertising", "programmatic", "ad tech"]
// }
```

Pass a `taxonomyKeys` map to rename category keys. Only taxonomies present in the map are emitted (filter + rename), which is useful when you only want to set keys you have configured in your ad server:

```javascript
sdk.ctxTargetingKeyValues({ iab_ct_3_1: "foo" });
// => { "foo": ["53", "91", "58", "115", "90", "52"], "ctx_kw": ["advertising", "programmatic", "ad tech"] }
```

Keyword values are ordered by `prominence` (most prominent first), capped to the top 10, and sanitized to GAM's value rules (lowercased, [reserved characters](https://support.google.com/admanager/answer/10020177) stripped, truncated to the 40-character value limit). Use the `options` argument to change the keyword key (`keywordKey`), change the cap (`maxKeywords`), or opt out of keyword key-values by passing an empty `keywordKey`:

```javascript
// Rename the keyword key and emit only the top 5 keywords:
sdk.ctxTargetingKeyValues({ iab_ct_3_1: "foo" }, { keywordKey: "kw", maxKeywords: 5 });
// => { "foo": ["53", ...], "kw": ["advertising", "programmatic", "ad tech", "marketing", "audience targeting"] }

// Opt out of keyword key-values entirely:
sdk.ctxTargetingKeyValues(undefined, { keywordKey: "" });
// => { "iab_ct_3_1": ["53", "91", "58", "115", "90", "52"] }
```

A typical Google Ad Manager activation uses a `loadGAM()` helper:

```javascript
// Helper to load GAM ads with optional targeting data:
var loadGAM = function (tdata = {}) {
  window.googletag = window.googletag || { cmd: [] };
  googletag.cmd.push(function () {
    for (const [key, values] of Object.entries(tdata)) {
      googletag.pubads().setTargeting(key, values);
    }
    googletag.pubads().refresh();
  });
};
```

Because `ctxTargetingKeyValues()` reads the cached response, the instance should be initialized with `initContextual: true` so the segments are fetched during initialization and the cache is likely populated by the time `loadGAM()` runs:

```javascript
loadGAM(optable.instance.ctxTargetingKeyValues());
```

If you want `loadGAM()` to run as soon as the contextual segments arrive — without making a second `ctxSegments()` call — pass a callback to `initContextual`. The SDK fires the contextual request automatically during initialization and invokes the callback with the response, populating the cache before `ctxTargetingKeyValues()` reads from it:

```javascript
const sdk = new OptableSDK({
  host: "dcn.customer.com",
  site: "my-site",
  initContextual: function (response) {
    loadGAM(sdk.ctxTargetingKeyValues());
  },
});
```

If you are not using `initContextual` at all, fetch the segments explicitly and call `loadGAM()` once `ctxSegments()` resolves (falling back to an untargeted load on error):

```javascript
optable.cmd.push(function () {
  optable.instance
    .ctxSegments()
    .then(loadGAM)
    .catch((err) => {
      loadGAM();
    });
});
```

You can also rename and allow-list the GAM keys by passing a `taxonomyKeys` map to `ctxTargetingKeyValues()` (only the taxonomies present in the map are emitted):

```javascript
// Emit only the "iab_ct_3_1" taxonomy, under the GAM key "ctx_iab":
loadGAM(optable.instance.ctxTargetingKeyValues({ iab_ct_3_1: "ctx_iab" }));
```

## Using a script tag

For each [SDK release](https://github.com/Optable/optable-web-sdk/releases), a webpack-generated browser bundle targeting the browsers list described by `pnpm dlx browserslist "> 0.25%, not dead"` can be loaded on a website via a `script` tag.

As described in the **Installation** section above, the recommended way to load the SDK via `script` tag is asynchronously using the `async` attribute, to avoid blocking page rendering.

### Option 1: Automatic Initialization

If you want to avoid manually instantiating the SDK, you can define the `instance_config` before loading the SDK bundle. When the script loads, it will automatically initialize the SDK using this configuration and assign the instance to `window.optable.instance`.

```html
<!-- Define configuration before loading the SDK -->
<script>
  window.optable = { cmd: [], instance_config: { host: "dcn.customer.com", site: "my-site" } };
</script>

<!-- Asynchronously load the SDK -->
<script async src="https://cdn.optable.co/web-sdk/v0/sdk.js"></script>

<!-- Optionally identify a client-side user after the page loads -->
<script>
  window.addEventListener("DOMContentLoaded", () => {
    optable.cmd.push(() => {
      const emailInput = document.getElementById("email");
      optable.instance.identify(optable.SDK.eid(emailInput.value)).then(() => {
        console.log("Identify API Success!");
      });
    });
  });
</script>
```

### Option 2: Manual Initialization with Commands Queue

You can also manually initialize the SDK using the cmd queue. This approach is useful if you prefer full control or are loading the config dynamically.

```html
<!-- Asynchronously load the SDK as early as possible: -->
<script async src="https://cdn.optable.co/web-sdk/v0/sdk.js"></script>

<!-- Later in the page: -->
<script>
  // Setup stub that will get replaced once the SDK get loaded
  window.optable = window.optable || { cmd: [] };
  optable.cmd.push(() => {
    // At this point optable.SDK is available and can be used to create a new sdk instance.
    // That instance can be stored anywhere for later referencing.
    // One option is to keep it within the global optable object space.
    optable.instance = new optable.SDK({ host: "dcn.customer.com", site: "my-site" });
  });
  // Now configure DOM content loaded event listener to dispatch identify() API:
  window.addEventListener("DOMContentLoaded", (event) => {
    optable.cmd.push(() => {
      // Fetch input on document load
      const emailInput = document.getElementById("email");
      optable.instance.identify(optable.SDK.eid(emailInput.value)).then(() => console.log("Identify API Success!"));
    });
  });
</script>

<input type="text" id="email" value="some.email@address.com" />
```

## Integrating PrebidJS analytics

The `OptablePrebidAnalytics` addon hooks into [Prebid.js](https://prebid.org/) auction events (`auctionEnd` and `bidWon`) and sends auction analytics to the Optable DCN via the **witness API**. It reports per-bidder EID coverage, bid outcomes, and optional custom key-value pairs, enabling you to measure the impact of Optable targeting on your Prebid auctions.

### Script tag

When the SDK is loaded via a `<script>` tag, `OptablePrebidAnalytics` is available as `window.optable.OptablePrebidAnalytics`.

```html
<!-- Optable SDK async load: -->
<script async src="https://cdn.optable.co/web-sdk/v0/sdk.js"></script>

<!-- Prebid.js async load: -->
<script async src="prebid.js"></script>

<script>
  window.optable = window.optable || { cmd: [] };
  window.pbjs = window.pbjs || { que: [] };

  optable.cmd.push(function () {
    optable.instance = new optable.SDK({ host: "dcn.customer.com", site: "my-site" });

    const analytics = new optable.OptablePrebidAnalytics(optable.instance, {
      analytics: true,
      tenant: "my_tenant", // Replace with your Optable tenant name
    });

    analytics.hookIntoPrebid(window.pbjs);
  });
</script>
```

### NPM package

When using the SDK as an NPM package, import `OptablePrebidAnalytics` directly from the addon module:

```javascript
import OptableSDK from "@optable/web-sdk";
import OptablePrebidAnalytics from "@optable/web-sdk/lib/addons/prebid/analytics";

const sdk = new OptableSDK({ host: "dcn.customer.com", site: "my-site" });

const analytics = new OptablePrebidAnalytics(sdk, {
  analytics: true,
  tenant: "my_tenant", // Replace with your Optable tenant name
});

analytics.hookIntoPrebid(window.pbjs);
```

For extended configuration options such as sampling, debug mode, and custom analytics data, see the [Prebid analytics addon README](lib/addons/prebid/README.md).

## Integrating GAM360

The Optable Web SDK can fetch targeting data from a DCN and map it to be sent to [Google Ad Manager 360](https://admanager.google.com/home/) ad server account for real-time targeting. It's also capable of intercepting advertising events from the [Google Publisher Tag](https://developers.google.com/doubleclick-gpt/guides/get-started) and logging them to a DCN via the **witness API**.

### Targeting key values

Loading the Optable SDK via a `script tag` on a web page which also uses the [Google Publisher Tag](https://developers.google.com/doubleclick-gpt/guides/get-started), we can further extend the `targeting` example above to show an integration with a [Google Ad Manager 360](https://admanager.google.com/home/) ad server account.

It's suggested to load the GAM banner view with an ad even when the call to your DCN `targeting()` method raises an exception, as shown in the example below:

```html
<!-- Optable SDK async load: -->
<script async src="https://cdn.optable.co/web-sdk/v0/sdk.js"></script>

<!-- Google Publisher Tag (GPT) async load: -->
<script async src="https://securepubads.g.doubleclick.net/tag/js/gpt.js"></script>

<!-- Optable SDK, GPT, and targeting data initialization: -->
<script>
  window.optable = window.optable || { cmd: [] };
  window.googletag = window.googletag || { cmd: [] };

  // Init Optable SDK via command:
  optable.cmd.push(function () {
    optable.instance = new optable.SDK({ host: "dcn.customer.com", site: "my-site" });
  });

  // Init GPT and disable initial ad load so that we can load targeting data first:
  googletag.cmd.push(() => {
    adSlot = googletag
      .defineSlot(...)
      .addService(googletag.pubads());

    googletag.pubads().enableSingleRequest();
    googletag.pubads().disableInitialLoad();
    googletag.enableServices();
  });
</script>

<!-- Placeholder DIV for adSlot... referenced by googletag.defineSlot() above: -->
<div id="div-gpt-ad-12345-0"></div>

<script>
  // Helper to load GAM ads with optional targeting data:
  var loadGAM = function (tdata = {}) {
    // Sets up page-level targeting in GAM360 GPT:
    window.googletag = window.googletag || { cmd: [] };
    googletag.cmd.push(function () {
      for (const [key, values] of Object.entries(tdata)) {
        googletag.pubads().setTargeting(key, values);
      }

      // Explicitly calls refresh() on googletag:
      googletag.pubads().refresh();
    });
  };

  // Call Optable DCN for targeting data and setup GPT page-level targeting, then
  // explicitly refresh GPT ads.
  //
  // NOTE: We load and refresh GPT ads without targeting data when there is an exception,
  // so that GAM ads are always loaded.
  optable.cmd.push(function () {
    optable.instance
      .targetingKeyValues()
      .then(loadGAM)
      .catch((err) => {
        loadGAM();
      });
  });

  googletag.cmd.push(() => {
    googletag.display(adSlot);
  });
</script>
```

Note the use of `googletag.pubads().disableInitialLoad()` in the above example. This will disable GAM ads from loading until the call to `googletag.pubads().refresh()` from the `loadGAM()` function.

### Targeting key values from local cache

It's also possible to avoid disabling of the initial ad load by using the SDK's `targetingKeyValuesFromCache()` method instead as in the following example:

```html
<!-- Optable SDK async load: -->
<script async src="https://cdn.optable.co/web-sdk/v0/sdk.js"></script>

<!-- Google Publisher Tag (GPT) async load: -->
<script async src="https://securepubads.g.doubleclick.net/tag/js/gpt.js"></script>

<!-- Optable SDK, GPT, and targeting data initialization: -->
<script>
  window.optable = window.optable || { cmd: [] };
  window.googletag = window.googletag || { cmd: [] };

  // Init Optable SDK via command:
  optable.cmd.push(function () {
    optable.instance = new optable.SDK({ host: "dcn.customer.com", site: "my-site" });
  });

  // Init GPT and disable initial ad load so that we can load targeting data first:
  googletag.cmd.push(() => {
    adSlot = googletag
      .defineSlot(...)
      .addService(googletag.pubads());

    // Attempt to load Optable targeting key values from local cache, then load GAM ads:
    optable.cmd.push(function () {
      const tdata = optable.instance.targetingKeyValuesFromCache();
      for (const [key, values] of Object.entries(tdata)) {
        googletag.pubads().setTargeting(key, values);
      }

      googletag.pubads().enableSingleRequest();
      googletag.enableServices();
    });
  });
</script>

<!-- Placeholder DIV for adSlot... referenced by googletag.defineSlot() above: -->
<div id="div-gpt-ad-12345-0"></div>

<script>
  // Call Optable DCN for targeting data which will update the local cache on success.
  optable.cmd.push(function () {
    optable.instance.targeting().catch((err) => {
      // Maybe log error
    });
  });

  googletag.cmd.push(() => {
    googletag.display(adSlot);
  });
</script>
```

Note that the above example fetches locally cached targeting key values and calls `googletag.pubads().setTargeting()` with them. Note also that the usual `targeting()` call is done as well, though its return value is ignored. This ensures that the local targeting cache is kept updated as activations are modified.

### Witnessing ad events

To automatically capture GPT [SlotRenderEndedEvent](https://developers.google.com/doubleclick-gpt/reference#googletag.events.slotrenderendedevent) and [ImpressionViewableEvent](https://developers.google.com/doubleclick-gpt/reference#googletag.events.impressionviewableevent) and send log data to your DCN using the **witness API**, simply install GPT event listeners on the SDK instance as follows:

```html
<!-- Optable SDK async load: -->
<script async src="https://cdn.optable.co/web-sdk/v0/sdk.js"></script>
<script>
  window.optable = window.optable || { cmd: [] };
  optable.cmd.push(function () {
    optable.instance.installGPTEventListeners();
  });
</script>
```

Advanced usage:
You can customize which GPT events are registered and which event properties to include, per event type, by passing an options object:

```js
// Only listen to impressionViewable and emit only `slot_element_id`
optable.instance.installGPTEventListeners({ impressionViewable: ["slot_element_id"] });

// For slotRenderEnded, emit all properties. For impressionViewable, emit only the listed properties.
optable.instance.installGPTEventListeners({
  slotRenderEnded: "all",
  impressionViewable: ["slot_element_id", "is_empty"],
});
```

The value for each event key can be "all" (to include all witness properties) or an array of property names from the set below (as mapped by the SDK):

`advertiser_id`, `campaign_id`, `creative_id`, `is_empty`, `line_item_id`, `service_name`, `size`, `slot_element_id`, `source_agnostic_creative_id`, `source_agnostic_line_item_id`.
If no argument is provided, the default behavior is unchanged and both slotRenderEnded and impressionViewable are captured with all properties.

Note that you can call `installGPTEventListeners()` as many times as you like on an SDK instance, there will only be one set of registered event listeners per instance. Each SDK instance can register its own GPT event listeners.

A working example of both targeting and event witnessing is available in the demo pages.

### GAM Secure Signals

The Optable Web SDK provides a method `installGPTSecureSignals` to pass user-defined signals to Google Ad Manager (GAM) [Secure Signals](https://support.google.com/admanager/answer/10488752). The method supports an array of objects, each representing a unique signal to pass to GAM, for example:

```html
<!-- Optable SDK async load: -->
<script async src="https://cdn.optable.co/web-sdk/latest/sdk.js"></script>
<script>
  const mySecureSignals = [];
  mySecureSignals.push({
    // Name of the provider
    provider: "uidapi.com",
    // ID to use in the Secure Signal
    value: "uid2_token_goes_here",
  });
  window.optable = window.optable || { cmd: [] };
  optable.cmd.push(function () {
    optable.instance.installGPTSecureSignals(mySecureSignals);
  });
</script>
```

Please refer to the list of approved Secure Signal [providers](https://support.google.com/admanager/answer/14750072). Please refer to the provider's integration documentation for the exact provider name and value to pass as a signal.

You can verify the signal was correctly passed to GAM by searching for its value cached in `localStorage` under the key `_GESPSK-<provider_name>`.

## Integrating Prebid

The Optable Web SDK can integrate with Prebid.js to provide targeting data for real-time bidding. There are three main ways to integrate:

### Open Pair ID Prebid Module

For publishers who only need to transmit Optable's cleanroom PAIR IDs in the bid stream, the [Open Pair ID Prebid module](https://docs.prebid.org/dev-docs/modules/userid-submodules/open-pair) provides a simple integration method.
This approach is recommended when PAIR ID transmission is your only requirement.

Here's how to integrate it:

```html
<!-- Optable SDK async load: -->
<script async src="https://cdn.optable.co/web-sdk/v0/sdk.js"></script>

<!-- Prebid.js lib async load: -->
<script async src="prebid.js"></script>

<!-- Initialize Optable SDK and cache PAIR identifiers: -->
<script>
  window.optable = window.optable || { cmd: [] };
  // Init Optable SDK via command:
  optable.cmd.push(function () {
    optable.instance = new optable.SDK({ host: "dcn.customer.com", site: "my-site" });
  });
  // Call targeting() to cache PAIR identifiers
  optable.cmd.push(function () {
    optable.instance.targeting().catch((err) => {
      // Maybe log error
    });
  });
</script>

<!-- Configure Prebid.js to use the cached PAIR identifiers: -->
<script>
  window.pbjs = window.pbjs || { que: [] };
  pbjs.que.push(function () {
    // Configure the Open Pair Prebid module to look for our cached PAIR identifiers
    pbjs.mergeConfig({
      userSync: {
        userIds: [
          {
            name: "openPairId",
            inserter: "<PUBLISHER DOMAIN>", // Replace with your publisher domain
            matcher: "optable.co",
            params: {
              optable: { storageKey: "_optable_pairId" },
            },
          },
        ],
      },
    });
    // Request bids - the Open Pair module will automatically include the PAIR identifiers
    pbjs.requestBids({
      bidsBackHandler: function (bids) {
        // Handle bids
      },
      timeout: 3000,
    });
  });
</script>
```

Key points about this integration:

- It only transmits PAIR IDs, making it simpler than the full ORTB2 integration
- The PAIR IDs are automatically picked up from the Optable SDK's local storage
- No additional configuration is needed beyond this snippet
- It's compatible with all bidders that support the Open Pair ID module

If you need to transmit additional targeting data or have more control over what information is sent to bidders, you should use the ORTB2 integration method described in the next section.

### Seller Defined Audiences

The HTML code snippet below shows how `prebidORTB2FromCache()` can be used to retrieve targeting data from the `LocalStorage` administered by the Optable SDK, and write Seller Defined Audiences (SDA) into [prebid.js](https://prebid.org/product-suite/prebid-js/) which is also loaded into the page, using `pbjs.mergeConfig({ ortb2: ortb2 })` as documented in [the prebid.js first party data documentation](https://docs.prebid.org/features/firstPartyData.html#segments-and-taxonomy). The `targeting()` API is also called in order to retrieve and locally store the latest matching activations from `dcn.customer.com/my-site`.

Note that [prebid.js bidder adapters](https://docs.prebid.org/dev-docs/bidders.html) can subsequently retrieve the data from the [global config](https://docs.prebid.org/features/firstPartyData.html#supplying-global-data).

An example of how to install the SDA data through `pbjs` is shown below. The `districtMDMX` bidder adapter is referenced, though the integration would look similar with any SDA compatible bidder adapters.

For a working demo showing a `pbjs` and GAM integrated together, see the [demo pages section](#demo-pages) below.

```html
<!-- Optable SDK async load: -->
<script async src="https://cdn.optable.co/web-sdk/v0/sdk.js"></script>

<!-- Prebid.js lib async load: -->
<script async src="prebid.js"></script>

<!-- Initialize Optable SDK, and targeting call early when possible: -->
<script>
  window.optable = window.optable || { cmd: [] };

  // Init Optable SDK via command:
  optable.cmd.push(function () {
    optable.instance = new optable.SDK({ host: "dcn.customer.com", site: "my-site" });
  });

  // Call Optable DCN for targeting data which will update the local cache on success.
  optable.cmd.push(function () {
    optable.instance.targeting().catch((err) => {
      // Maybe log error
    });
  });
</script>

<!-- Placeholder DIV for adSlot -->
<div id="div-gpt-ad-12345-0"></div>

<!-- Initialize prebid.js -->
<script>
  window.pbjs = window.pbjs || { que: [] };

  var PREBID_TIMEOUT = 3000;
  var FAILSAFE_TIMEOUT = 5000;

  var adUnits = [
    {
      code: "/22081946781/web-sdk-demo/box-ad",
      mediaTypes: {
        banner: {
          sizes: [
            [250, 250],
            [300, 250],
            [200, 200],
          ],
        },
      },
      bids: [
        {
          bidder: "districtmDMX",
          params: {
            dmxid: "/22081946781/web-sdk-demo/box-ad",
            memberid: "102034",
          },
        },
      ],
    },
  ];

  function initAdserver() {
    if (pbjs.initAdserverSet) return;
    pbjs.initAdserverSet = true;
    // ... etc ...
  }

  pbjs.que.push(function () {
    optable.cmd.push(function () {
      const ortb2 = optable.instance.prebidORTB2FromCache();
      pbjs.mergeConfig({ ortb2: ortb2 });

      // ... etc ...

      pbjs.requestBids({
        bidsBackHandler: initAdserver,
        timeout: PREBID_TIMEOUT,
      });
    });
  });

  setTimeout(function () {
    initAdserver();
  }, FAILSAFE_TIMEOUT);
</script>
```

### Custom key values

For bidder adapters that do not support SDA, but that do support targeting private marketplace deals to key values, you can use a similar approach to the [Google Ad Manager integration with key values from local cache](#targeting-key-values-from-local-cache). For example, for the IX bidder adapter and [IX bidder-specific FPD](https://docs.prebid.org/dev-docs/bidders/ix.html#ix-bidder-specific-fpd), you can encode the targeting key values as shown below:

```html
<script>
  // ...
  // prior to pbjs.requestBids():
  pbjs.que.push(function () {
    optable.cmd.push(function () {
      const tdata = optable.instance.targetingKeyValuesFromCache();
      var fpd = {};

      /*
       * Flatten targeting key=values from Optable SDK targeting cache
       * into a custom key value object, such that a key K with values
       * V1, V2, ... in the Optable SDK targeting cache is transformed
       * to look like:
       * {
       *   K + V1: 1,
       *   K + V2: 1,
       *   ...
       * }
       *
       * Note that + above indicates string concatenation.
       *
       * Optable DCNs have K configured to "optable" by default, so the
       * above would result in a custom key value "optable_audienceKeyword=1"
       * being set whenever the visitor is matched to the activated audience
       * specified by audienceKeyword by the DCN.
       */
      for (const [key, values] of Object.entries(tdata || {})) {
        for (const seg of values) {
          fpd[key + seg] = "1";
        }
      }

      pbjs.mergeConfig({
        ix: {
          firstPartyData: fpd,
        },
      });
    });

    pbjs.requestBids(...);
  });
</script>
```

## Identifying visitors arriving from Email newsletters

If you send Email newsletters that contain links to your website, then you may want to automatically _identify_ visitors that have clicked on any such links via their Email address.

### Insert oeid into your Email newsletter template

To enable automatic identification of visitors originating from your Email newsletter, you first need to include an **oeid** parameter in the query string of all links to your website in your Email newsletter template. The value of the **oeid** parameter should be set to the SHA256 hash of the lowercased Email address of the recipient. For example, if you are using [Braze](https://www.braze.com/) to send your newsletters, you can easily encode the SHA256 hash value of the recipient's Email address by setting the **oeid** parameter in the query string of any links to your website as follows:

```javascript
oeid={{${email_address} | downcase | sha2}}
```

The above example uses various personalization tags as documented in [Braze's user guide](https://www.braze.com/docs/user_guide/personalization_and_dynamic_content/) to dynamically insert the required data into an **oeid** parameter, all of which should make up a _part_ of the destination URL in your template.

### Call tryIdentifyFromParams SDK API

On your website destination page, you can call a helper method provided by the SDK which will attempt to parse and validate a given query string parameter as EID (defaults to **oeid**), when found, it will automatically trigger a call to Optable's **identify** API.

For example:

```html
<!-- Optable SDK async load: -->
<script async src="https://cdn.optable.co/web-sdk/v0/sdk.js"></script>
<script>
  window.optable = window.optable || { cmd: [] };
  optable.cmd.push(function () {
    optable.instance = new optable.SDK({ host: "dcn.customer.com", site: "my-site" });

    // Identify using a valid EID (email SHA256) "oeid" query string parameter.
    optable.instance.tryIdentifyFromParams();

    // Or if the EID is being passed through a "email_sha" query string
    // like https://www.mysite.com?origin=newsletter&email_sha=abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789&foo=bar
    // optable.instance.tryIdentifyFromParams("email_sha");

    // Optionally, you can provide a custom prefix as the second argument to tryIdentifyFromParams.
    // This prefix will be used in the constructed identifier, allowing you to capture a value
    // from the URL parameter even if it may not be a SHA256-hashed email.
    // For example, optable.instance.tryIdentifyFromParams("email_md5", "c2");
    // You can find a list of supported prefixes at https://docs.optable.co/optable-documentation/dmp/reference/identifier-types#type-prefixes
  });
</script>
```

## Passport and Visitor ID

The Optable DCN issues a _passport_ (a signed JWT) that is cached in browser `localStorage`. The passport encodes a unique _visitor ID_ that the DCN uses to anonymously identify the browser. Both values can be read synchronously from the SDK:

```javascript
const passport = sdk.passport(); // string | null — the raw JWT as stored in localStorage
const visitorId = sdk.visitorId(); // string | null — the `id` claim decoded from the passport
```

Both methods return `null` until the passport has been populated in `localStorage`. By default (`initPassport: true`) the SDK triggers a `/config` call at construction time, and the DCN response populates the passport.

If the returned value is `null`, the SDK logs a one-time warning per instance to help diagnose the cause. The two expected reasons for a `null` return are:

1. The method was called before the passport was cached (e.g. before `sdk.site()` resolved).
2. The DCN is configured to not echo the passport in response bodies, in which case the client-side cache is never populated.

## Optable Identity System (OIS)

The Optable Identity System is a cross-tenant identity system. On a DCN node configured to use it, the OIS ID replaces the [visitor ID](#passport-and-visitor-id) as the canonical profile identifier for collected events — the DCN makes that substitution itself, based on the node's identity selector.

The DCN normally carries the OIS ID in an `OPTABLE_OID` cookie. That cookie is scoped to `Domain=optable.co` with `SameSite=None`, which makes it a **third-party** cookie for a publisher page, so it is dropped wherever cross-site cookies are blocked (Safari/ITP, Firefox ETP, Chrome's third-party cookie restrictions). When it is dropped, the DCN cannot recognize the browser and mints a throwaway ID on every request.

Enabling `ois` closes that gap: the SDK stores the ID the DCN reports and replays it on an `X-Optable-OID` request header, so the browser presents the same identity whether or not the cookie survives.

> :warning: **Requires an OIS-enabled node.** On a node that does not use OIS the DCN returns no OIS ID and the option is inert. Ask your Optable contact whether your node has OIS enabled.

### Enabling OIS

```javascript
const sdk = new OptableSDK({
  host: "dcn.customer.com",
  site: "my-site",
  ois: true,
  // Optional, but recommended alongside OIS: lets the DCN derive a
  // fingerprint-based ID for browsers with no usable storage at all.
  forwardSignals: true,
});
```

Or with a script tag:

```html
<script type="text/javascript">
  window.optable = window.optable || { cmd: [] };

  optable.cmd.push(function () {
    optable.instance = new optable.SDK({
      host: "dcn.customer.com",
      site: "my-site",
      ois: true,
      forwardSignals: true,
    });
  });
</script>
<script async src="https://cdn.optable.co/web-sdk/vX.Y.Z/sdk.js"></script>
```

Nothing is stored and no header is sent without device access consent, so the option is also a no-op when consent has not been granted.

### Reading the OIS ID

```javascript
const id = sdk.oisId(); // string | null — the stored OIS ID
const state = sdk.oisState(); // full state, including which transport carried it
sdk.oisClear(); // forget the stored ID; the DCN issues a new one on the next call
```

`oisState()` returns:

```typescript
type OISState = {
  id: string | null;
  source: "cookie" | "header" | "minted" | null; // transport the DCN last resolved from
  transport: "cookie" | "localstorage" | "unknown";
  storageKey: string;
  storageWritable: boolean | null; // null until a write has been attempted
  updatedAt: number | null;
};
```

The SDK dispatches an `optable-ois:change` event on `window` whenever the stored ID changes, so a page can react without polling:

```javascript
window.addEventListener("optable-ois:change", (e) => console.log(e.detail));
```

Like `passport()` and `visitorId()`, these return `null` until a DCN response has reported an ID. By default (`initPassport: true`) the `/config` call made at construction time is the first response to carry one.

### How the ID is stored and replayed

The ID is cached in `localStorage` under `OPTABLE_OIS_<base64(host[/node])>`, alongside the transport the DCN reported it from. The DCN returns that transport as `oid_source`, and the SDK uses it to decide whether to overwrite what it already holds:

| `oid_source` | Meaning                                              | Action                                   |
| ------------ | ---------------------------------------------------- | ---------------------------------------- |
| `cookie`     | The `OPTABLE_OID` cookie reached the DCN             | Always stored                            |
| `header`     | The DCN used the ID the SDK replayed                 | Nothing to do                            |
| `minted`     | Neither transport carried an ID, so the DCN made one | Stored **only** if nothing is stored yet |

Storing the cookie's own value is what makes the identity survive third-party cookies being turned off later: the fallback replays the same ID the cookie was carrying, rather than introducing a new one. The `minted` rule is what keeps the ID stable — a mint arrives on every request to an endpoint that does not replay the header, so treating it as authoritative would churn the ID on each page load.

Two things go on the wire. An `ois=1` query parameter opts into receiving the ID: the DCN returns it only to a caller that asks, because it is a stable cross-site identifier — the same reason the passport is echoed in-band only when the client selects query-string transport. That parameter is sent on every request, since the first response is what bootstraps the stored ID.

The `X-Optable-OID` header, which replays a stored ID, is sent only on `/identify`, `/sync`, `/uid2/token`, `/v2/targeting`, `/witness` and `/profile`. It is deliberately **not** sent on `/config`: a custom header makes a request non-simple, and adding a CORS preflight to the SDK's initialization path would cost a round trip on every page load. A query parameter has no such cost, which is why the opt-in and the replay are carried differently.

The DCN also withholds the ID without read consent, so a visitor whose consent does not permit identity reads gets no ID and the SDK stores nothing.

The DCN reads the cookie **before** the header, so replaying an ID never overrides a cookie that did arrive. The SDK always sends the header when it holds an ID and lets the DCN arbitrate.

The `ois_id` and `oid_source` fields are removed from the response payload once consumed, for the same reason the passport is: a targeting response is handed to ad servers and written to the targeting cache.

### Which transport is in use

`OPTABLE_OID` is `HttpOnly`, so JavaScript can never read it and a browser cannot observe for itself whether the cookie was sent. `transport` is therefore derived from what the DCN reports, not guessed:

- **`cookie`** — the cookie reached the DCN on the last call.
- **`localstorage`** — the cookie did not arrive and the DCN used the replayed ID.
- **`unknown`** — nothing stored yet, or the DCN minted an ID. A mint happens both on a first visit and when the cookie is blocked, and those are indistinguishable from the browser, so this case does not claim either.

## QA and debug flags

Flags are per-session overrides for exercising SDK behaviour that is otherwise decided automatically — forcing a split-test variant, bypassing consent, turning on verbose logging. They are set from the page URL and read back through `getFlags()`.

```
https://example.com/article?optableDebug&optableForceTargeting
```

A bare flag name means enabled, `=0` means explicitly off. Flags supplied in the URL are persisted to `sessionStorage`, so a flag set once stays in effect for the rest of the tab session without re-appending the query string.

Use `flagEnabled()` for on/off flags, and `getFlags()` when a flag has more than two meanings:

```typescript
import { flagEnabled, getFlags } from "@optable/web-sdk/lib/dist/core/flags";

if (flagEnabled("optableDebug")) {
  console.log("[wrapper]", ...args);
}

// optableControlGroup is two-state: "1" forces control, "0" forces treatment.
const controlGroup = getFlags().optableControlGroup;
```

Flag values are strings, and `"0"` is truthy in JavaScript, so do not test a raw value for truthiness — `if (getFlags().optableDebug)` is `true` for `?optableDebug=0`. Use `flagEnabled()` instead.

These are a QA and debugging facility; none of them should be set on production traffic. For the full flag table and resolution order, see the [flags README](lib/core/flags.md).

## Multi-Node Targeting Resolver

Resolves multiple **Node Targeting Rules** based on **priority** or **aggregation**.
This function is available under `window.optable.utils` as part of a collection of helper methods extending the SDK.

### Usage

Define targeting rules:

```typescript
const rules: NodeTargetingRule[] = [
  {
    targetingFn: async () => window.optable.node_sdk_instance_one.targeting(),
    matcher: "your_domain",
    mm: 3, // Authenticated
    priority: 1, // Highest Priority (Optional)
  },
  {
    targetingFn: async () => window.optable.node_sdk_instance_two.targeting("__ip__"),
    matcher: "third_party_vendor",
    mm: 5, // inference
    priority: 2, // Lower Priority (Optional)
  },
  {
    // Example with multiple identifiers
    targetingFn: async () =>
      window.optable.node_sdk_instance_three.targeting({
        ids: ["identifier1", "identifier2"],
      }),
    matcher: "another_vendor",
    mm: 5, // inference
  },
];
```

Call the resolver:

```typescript
const result = await window.optable.utils.resolveMultiNodeTargeting(rules);
console.log(result);
```

### Rules

- If **any rule has a `priority`**, the function will return the response with the highest priority (1 being the highest). Lower priorities (2, 3, etc.) are considered progressively less important. Any rules with priority values of 0 or below are ignored.
- If **multiple nodes share the highest priority**, merges their `eids`.
- If **no priority is set**, aggregates all responses.

### Return Value

```typescript
type MultiNodeTargetingResponse = {
  // All sources that resolved the response
  eidSources: Set<string>;
  // IAB OpenRTB 2.6 Ortb2 User Object (Partial)
  ortb2: { user: { eids: EID[]; data: Data[] } };
};
```

### Input Type

```typescript
type NodeTargetingRule = {
  // Targeting function to resolve. e.g. window.optable.node_sdk_instance.targeting('__ip__')
  // For multiple identifiers, use: window.optable.node_sdk_instance.targeting({ ids: ["id1", "id2"] })
  targetingFn: () => Optable.TargetingFn(targetingArg: string | { ids?: string[] });
  // Technology provider domain
  matcher: string;
  // Match method (mm) based on IAB v26 standards.
  // Determines how the ID was matched. Possible values:
  // 0 = unknown, 1 = no_match, 2 = cookie_sync, 3 = authenticated, 4 = observed, 5 = inference.
  mm: IDMatchMethod;
  // (Optional) If provided we will only pick one resolved Ortb2Response from the most prioritize matcher.
  // Any values below 1 will be threated as ignore
  priority?: number;
};
```

## Geo-routing

The geo-routing addon maps a visitor's region code to the Optable edge host that should serve them, so that a single SDK bundle can route traffic to the right regional edge.

```typescript
import { getGeoRouting } from "@optable/web-sdk/lib/dist/addons/geo-routing";

const host = getGeoRouting(visitorRegion); // e.g. "na.edge.optable.co" for "US"

if (host) {
  const sdk = new OptableSDK({
    host,
    node: "my-node",
    site: "my-site",
  });
}
```

`getGeoRouting` returns `null` when the region is not supported, in which case region-specific initialization should be skipped. The default `GeoMap` supports the `US` (alias `NA`), `CA`, `EU` and `AU` region codes, each mapped to its regional edge host; pass a custom `GeoMap` as the second argument for other regions.

Keys are region codes, not country codes. Translating a visitor's country code to a region code (for example `GB`/`UK` → `EU`) is the caller's responsibility — the addon deliberately knows only regions. The caller also supplies the SDK `node`/`site`; this addon only resolves the host.

For the full region table and custom `GeoMap` usage, see the [geo-routing addon README](lib/addons/geo-routing.md).

## Bot detection

The bot detection addon identifies requests coming from known bots and crawlers, so a wrapper can skip work that only makes sense for real visitors — edge calls, identity resolution, analytics samples. It is a pure function over the user agent, with no network calls or storage access.

```typescript
import { isBot } from "@optable/web-sdk/lib/dist/addons/botDetection";

if (isBot()) {
  return; // Skip targeting and analytics for this request.
}
```

With no argument it reads `navigator.userAgent`; pass a string to test one explicitly.

When the page also runs a Prebid RTD provider, prefer `SkipTargetingForBots()`. It calls `isBot()` and, for a bot, marks targeting as already done so the RTD module short-circuits instead of waiting for a targeting call that will never be made:

```typescript
import { SkipTargetingForBots } from "@optable/web-sdk/lib/dist/edge/targeting";

if (!SkipTargetingForBots()) {
  await sdk.targeting();
}
```

Matching is substring-based and case-insensitive, covering generic crawlers, headless browsers, HTTP clients and Google's non-search agents. It is deliberately broad and user-agent only — a cost-saving filter, not a fraud signal. For the full match list, see the [bot detection addon README](lib/addons/botDetection.md).

## Command queue

The command queue addon lets a page interact with a wrapper loaded via an async script tag before the script has arrived, in the style of `googletag.cmd` and `pbjs.que`. The page queues functions on a plain-array stub; the wrapper replaces the stub with an instance, which drains the queue and executes later pushes immediately.

```typescript
import { OptableCommands } from "@optable/web-sdk/lib/dist/addons/commands";

window.optable.cmd = new OptableCommands(window.optable.cmd || []);
```

For the page-side stub and behaviour details, see the [command queue addon README](lib/addons/commands.md).

## Demo Pages

The demo pages are working examples of both `identify` and `targeting` APIs, as well as an integration with the [Google Ad Manager 360](https://admanager.google.com/home/) ad server, enabling the targeting of ads served by GAM360 to audiences activated in the [Optable](https://optable.co/) DCN.

You can browse a recent (but not necessarily the latest) released version of the demo pages at [https://demo.optable.co/](https://demo.optable.co/). The source code to the demos can be found in the [demos directory](https://github.com/Optable/optable-web-sdk/tree/master/demos). The demo pages will connect to the [Optable](https://optable.co/) demo DCN at `sandbox.optable.co` and reference the web site slug `web-sdk-demo`. The GAM360 targeting demo loads ads from a GAM360 account operated by [Optable](https://optable.co/).

Note that the demo pages at [https://demo.optable.co/](https://demo.optable.co/) will by default rely on secure HTTP first-party cookies as described in [this section](https://github.com/Optable/optable-web-sdk#domains-and-cookies). To see an example based on [LocalStorage](https://github.com/Optable/optable-web-sdk#localstorage), see the [index-nocookies variant here](https://demo.optable.co/index-nocookies.html).

To build and run the demos locally, you will need [Docker](https://www.docker.com/), `docker-compose` and `make`:

```shell
cd path/to/optable-web-sdk
make
docker-compose up
```

Then head to [https://localhost:8180/](localhost:8180) to see the demo pages. You can modify the code in each demo, then run `make build` and finally refresh the demo pages to see your changes take effect. If you want to test the demos with your own DCN, make sure to update the configuration (hostname and site slug) given to the OptableSDK (see `webpack.config.js` for the react example).

Note that using HTTP first-party cookies with a local instance of the demos pages pointing to an Optable DCN will not work because [https://localhost:8180/](localhost:8180) does not share the same top-level domain name `.optable.co`. We recommend using [LocalStorage](https://github.com/Optable/optable-web-sdk#localstorage) instead.

The [Optable Identity System](#optable-identity-system-ois) demo (`/vanilla/ois.html`, or `/vanilla/nocookies/ois.html`) shows the OIS ID assigned to the browser, which transport carried it, and the decoded `sig` signals, and logs the `X-Optable-OID` header sent on each call. It requires an OIS-enabled DCN node. Because the demo is served from a different site than the DCN, `OPTABLE_OID` is a third-party cookie there — which is what makes it a realistic test: allow third-party cookies to see the `cookie` transport, block them to see the `localstorage` fallback take over while the ID stays the same.
