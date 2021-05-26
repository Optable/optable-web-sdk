# Optable Web SDK [![buildkite](https://badge.buildkite.com/314d07ac4946d31b6fde7a7534a9f13ab72c8aedf761a7ed24.svg)](https://buildkite.com/optable/web-sdk-publish-tag)

JavaScript SDK for integrating with an [Optable Data Connectivity Node (DCN)](https://docs.optable.co/) from a web site or web application.

## Contents

- [Installing](#installing)
  - [npm module](#npm-module)
  - [script tag](#script-tag)
- [Versioning](#versioning)
- [Domains and Cookies](#domains-and-cookies)
  - [LocalStorage](#localstorage)
- [Using (npm module)](#using-npm-module)
  - [Identify API](#identify-api)
  - [Profile API](#profile-api)
  - [Targeting API](#targeting-api)
  - [Witness API](#witness-api)
- [Using (script tag)](#using-script-tag)
- [Integrating GAM360](#integrating-gam360)
  - [Targeting key values](#targeting-key-values)
  - [Targeting key values from local cache](#targeting-key-values-from-local-cache)
  - [Witnessing ad events](#witnessing-ad-events)
- [Identifying visitors arriving from Email newsletters](#identifying-visitors-arriving-from-email-newsletters)
  - [Insert oeid into your Email newsletter template](#insert-oeid-into-your-email-newsletter-template)
  - [Call tryIdentifyFromParams SDK API](#call-tryidentifyfromparams-sdk-api)
- [Demo Pages](#demo-pages)

## Installing

The [Optable](https://optable.co/) web SDK can be installed as a ES6 compatible [npm](https://www.npmjs.com/) module paired with module bundlers such as [webpack](https://webpack.js.org/) or [browserify](http://browserify.org/), or can be loaded on a webpage directly by referencing a release build from the page HTML via a `<script>` tag.

> :warning: **CORS Configuration**: Regardless of how you install the SDK, make sure that the _Allowed HTTP Origins_ setting in the Optable DCN that you are integrating with contains the URL(s) of any web site(s) where the SDK is being used, otherwise your browser may block communication with the DCN.

### npm module

If you're building a web application or want to bundle the SDK functionality with your own JavaScript, then [npm](https://www.npmjs.com/) is the recommended installation method. It pairs nicely with module bundlers such as [webpack](https://webpack.js.org/) or [browserify](http://browserify.org/) and exports types for applications using the [typescript](https://www.typescriptlang.org/) language and type checker. To use it simply install the package:

```shell
# latest stable release:
$ npm install @optable/web-sdk
```

And then simply `import` and use the `OptableSDK` class as shown in the _Usage_ section below.

### script tag

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

The SDK does **not** depend on the availability of the third-party cookie feature in browsers. By default, the [Optable](https://optable.co/) SDK makes use of a secure HTTP-only _first-party_ browser cookie in order to anonymously identify browsers via a _visitor ID_, within the context of any web sites sharing an _effective top-level domain plus one_ (eTLD+1) with the configured DCN host.

For example, if your website runs at `www.customer.com` or `customer.com`, then ideally your DCN will be configured to run at `dcn.customer.com`, and will read/write a domain-level first-party cookie at `customer.com`. The contents of the cookie will not be accessible to any third-party scripts. Finally, the cookie will have the `SameSite=Lax`attribute so that it is available on the first visit.

> :warning: **Optable Visitor ID Scope**: The _visitor ID_ configured by the OptablDe CN will be unique to a browser only within the top-level domain that the DCN shares with the calling web site.

### LocalStorage

In cases where it is not practical or possible to configure your DCN to run on the same effective top-level domain plus one (eTLD+1) as your website(s), then the default cookie-based transport that the SDK depends on will not work. Instead, a fallback cookie-less transport utilizing browser `LocalStorage` is recommended. To switch to the cookie-less transport, simply set the optional `cookies` parameter to `false` when creating your SDK instance. For example:

```javascript
import OptableSDK from "@optable/web-sdk";

const sdk = new OptableSDK({ host: "dcn.customer.com", site: "my-site", cookies: false });
```

Note that the default is `cookies: true` and will be inferred if you do not specify the `cookies` parameter at all.

## Using (npm module)

To configure an instance of `OptableSDK` integrating with an [Optable](https://optable.co/) DCN running at hostname `dcn.customer.com`, from a configured web site origin identified by slug `my-site`, you simply create an instance of the `OptableSDK` class exported by the `@optable/web-sdk` module:

```js
import OptableSDK from "@optable/web-sdk";

const sdk = new OptableSDK({ host: "dcn.customer.com", site: "my-site" });
```

You can then call various SDK APIs on the instance as shown in the examples below. It's also possible to configure multiple instances of `OptableSDK` in order to connect to other (e.g., partner) DCNs and/or reference other configured web site slug IDs.

Note that all SDK communication with Optable DCNs is done over TLS. The only exception to this is if you instantiate the `OptableSDK` class with the `insecure` optional boolean parameter set to `true`. For example:

```js
const sdk = new OptableSDK({ host: "dcn.customer.com", site: "my-site", insecure: true });
```

However, since production DCNs only listen to TLS traffic, the above is meant to be used by Optable developers running the DCN locally for testing. See [developer docs](https://github.com/Optable/optable-web-sdk/tree/master/docs) for other developer notes.

### Identify API

To associate a user's browser with an authenticated identifier such as an Email address, optionally linked with other identifiers, such as your own vendor, publisher, or site-level `PPID`, you can call the `identify` API as follows:

```js
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

### Targeting API

To get the targeting key values associated by the configured DCN with the user's browser in real-time, you can call the targeting API as follows:

```js
sdk
  .targeting()
  .then((keyvalues) => {
    // Iterate over all the key values entries and print them
    for (const [key, values] of Object.entries(keyvalues)) {
      console.log(`Targeting KV: ${key} = ${values.join(",")}`);
    }
  })
  .catch((err) => console.warn(`Targeting API Error: ${err.message}`));
```

On success, the resulting key values are typically sent as part of a subsequent ad call. Therefore we recommend that you either call targeting() before each ad call, or in parallel periodically, caching the resulting key values which you then provide in ad calls.

#### Caching Targeting Data

The `targeting` API will automatically cache resulting key value data in client storage on success. You can subsequently retrieve the cached key value data as follows:

```{javascript
const cachedTargetingData = sdk.targetingFromCache();
if (cachedTargetingData) {
  for (const [key, values] of Object.entries(cachedTargetingData)) {
    console.log(`Targeting KV: ${key} = ${values.join(",")}`);
  }
}
```

You can also clear the locally cached targeting data:

```javascript
sdk.targetingClearCache();
```

Note that both `targetingFromCache()` and `targetingClearCache()` are synchronous.

### Witness API

To send real-time event data from the user's browser to the DCN for eventual audience assembly, you can call the witness API as follows:

```js
const onSuccess = () => console.log("Witness API success!");
const onFailure = (err) => console.warn("Witness API error: ${err.message}");

const eventProperties = {
  property_one: "some_value",
  property_two: 123,
  property_three: false,
};

sdk.witness("event.type.here", eventProperties).then(onSuccess).catch(onFailure);
```

The specified event type and properties are associated with the logged event and which can be used for matching during audience assembly.

Note that event properties are key value pairs and have type `WitnessProperties`:

```typescript
type WitnessProperties = {
  [key: string]: string | number | boolean;
};
```

## Using (script tag)

For each [SDK release](https://github.com/Optable/optable-web-sdk/releases), a webpack generated browser bundle targeting the browsers list described by `npx browserslist "> 0.25%, not dead"` can be loaded on a web site via a `script` tag.

As described in the **Installation** section above, in order to avoid having to block the rendering of the page, the recommended way to load the SDK via `script` tag is asynchronously with the `async` attribute. Therefore, to use the SDK you should take care to `push` your _commands_ onto the `window.optable.cmd` array of functions, which are automatically executed by the SDK browser bundle once it has loaded.

The browser bundle exports the same `OptableSDK` constructor documented in the **npm module** section above in the `optable` window object, as `optable.SDK`

The following shows an example of how to safely initialize the SDK and dispatch an `identify` API request to a DCN, from an input element after the document was loaded.

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

## Integrating GAM360

The Optable Web SDK can fetch targeting keyvalue data from a DCN and send it to a [Google Ad Manager 360](https://admanager.google.com/home/) ad server account for real-time targeting. It's also capable of intercepting advertising events from the [Google Publisher Tag](https://developers.google.com/doubleclick-gpt/guides/get-started) and logging them to a DCN via the **witness API**.

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
      .targeting()
      .then(function (result) {
        loadGAM(result);
      })
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

It's also possible to avoid disabling of the initial ad load by using the SDK's `targetingFromCache()` method instead as in the following example:

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
      const tdata = optable.instance.targetingFromCache();
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

Note that you can call `installGPTEventListeners()` as many times as you like on an SDK instance, there will only be one set of registered event listeners per instance. Each SDK instance can register its own GPT event listeners.

A working example of both targeting and event witnessing is available in the demo pages.

## Identifying visitors arriving from Email newsletters

If you send Email newsletters that contain links to your website, then you may want to automatically _identify_ visitors that have clicked on any such links via their Email address. Website traffic which is originating from a subscriber click on a link in a newsletter is considered to be implicitly authenticated by the recipient of the Email, therefore serving as an excellent source of linking of online user identities.

### Insert oeid into your Email newsletter template

To enable automatic identification of visitors originating from your Email newsletter, you first need to include an **oeid** parameter in the query string of all links to your website in your Email newsletter template. The value of the **oeid** parameter should be set to the SHA256 hash of the lowercased Email address of the recipient. For example, if you are using [Braze](https://www.braze.com/) to send your newsletters, you can easily encode the SHA256 hash value of the recipient's Email address by setting the **oeid** parameter in the query string of any links to your website as follows:

```
oeid={{${email_address} | downcase | sha2}}
```

The above example uses various personalization tags as documented in [Braze's user guide](https://www.braze.com/docs/user_guide/personalization_and_dynamic_content/) to dynamically insert the required data into an **oeid** parameter, all of which should make up a _part_ of the destination URL in your template.

### Call tryIdentifyFromParams SDK API

On your website destination page, you can call a helper method provided by the SDK which will attempt to parse and validate any **oeid** parameters passed to the page via query string and, when found, automatically trigger a call to Optable's **identify** API. For example:

```html
<!-- Optable SDK async load: -->
<script async src="https://cdn.optable.co/web-sdk/v0/sdk.js"></script>
<script>
  window.optable = window.optable || { cmd: [] };
  optable.cmd.push(function () {
    optable.instance = new optable.SDK({ host: "dcn.customer.com", site: "my-site" });
    optable.instance.tryIdentifyFromParams();
  });
</script>
```

## Demo Pages

The demo pages are working examples of both `identify` and `targeting` APIs, as well as an integration with the [Google Ad Manager 360](https://admanager.google.com/home/) ad server, enabling the targeting of ads served by GAM360 to audiences activated in the [Optable](https://optable.co/) DCN.

You can browse a recent (but not necessarily the latest) released version of the demo pages at [https://demo.optable.co/](https://demo.optable.co/). The source code to the demos can be found [here](https://github.com/Optable/optable-web-sdk/tree/master/demos). The demo pages will connect to the [Optable](https://optable.co/) demo DCN at `sandbox.optable.co` and reference the web site slug `web-sdk-demo`. The GAM360 targeting demo loads ads from a GAM360 account operated by [Optable](https://optable.co/).
