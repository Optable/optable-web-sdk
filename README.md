# Optable Web SDK [![buildkite](https://badge.buildkite.com/314d07ac4946d31b6fde7a7534a9f13ab72c8aedf761a7ed24.svg)](https://buildkite.com/optable/web-sdk-publish-tag)

JavaScript SDK for integrating with optable-sandbox from a web site or web application.

## Installation

The [Optable](https://optable.co/) web SDK can be installed as a ES6 compatible [npm](https://www.npmjs.com/) module paired with module bundlers such as [webpack](https://webpack.js.org/) or [browserify](http://browserify.org/), or can be loaded on a webpage directly by referencing a release build from the page HTML via a `<script>` tag.

> :warning: **CORS Configuration**: Regardless of how you install the SDK, make sure that the _Allowed HTTP Origins_ setting in the Optable sandbox that you are integrating with contains the URL(s) of any web site(s) where the SDK is being used, otherwise your browser may block communication with the sandbox.

### npm module

If you're building a web application or want to bundle the SDK functionality with your own JavaScript, then [npm](https://www.npmjs.com/) is the recommended installation method. It pairs nicely with module bundlers such as [webpack](https://webpack.js.org/) or [browserify](http://browserify.org/) and exports types for applications using the [typescript](https://www.typescriptlang.org/) language and type checker. To use it simply install the package:

```shell
# latest stable release:
$ npm install @optable/web-sdk
```

And then simply `import` and use the SDK class as shown in the _Usage_ section below.

### script tag

For simple integrations from your web site, you can load the SDK built for the browser from your sandbox via the HTML `script` tag. For a sandbox running at `sandbox.customer.com`include this tag in the `<head>` block of your HTML page:

```html
<script async src="https://sandbox.customer.com/static/web/sdk.js"></script>
```

Note the presence of the `async` attribute, which instructs browsers to load the library asynchronously and not block the page from rendering.

> :warning: **Releases**: Your [Optable](https://optable.co/) sandbox will always serve a specific [release](https://github.com/Optable/optable-web-sdk/releases) of the SDK, which you can configure via the Optable cloud control panel, or with the help of support.

## Domains and Cookies

The SDK does **not** depend on the availability of the third-party cookie feature in browsers. By default, the [Optable](https://optable.co/) SDK makes use of a secure HTTP-only _first-party_ browser cookie in order to anonymously identify browsers via a _visitor ID_, within the context of any web sites sharing an _effective top-level domain plus one_ (eTLD+1) with the configured sandbox host.

For example, if your website runs at `www.customer.com` or `customer.com`, then ideally your sandbox will be configured to run at `sandbox.customer.com`, and will read/write a domain-level first-party cookie at `customer.com`. The contents of the cookie will not be accessible to any third-party scripts. Finally, the cookie will have the `SameSite=Lax`attribute so that it is available on the first visit.

> :warning: **Optable Visitor ID Scope**: The _visitor ID_ configured by the Optable sandbox will be unique to a browser only within the top-level domain that the sandbox shares with the calling web site.

## Usage (npm module)

To configure an instance of the SDK integrating with an [Optable](https://optable.co/) sandbox running at hostname `sandbox.customer.com`, from a configured web site origin identified by slug `my-site`, you simply create an instance of the `SDK` class exported by the `@optable/web-sdk` module:

```js
import SDK from "@optable/web-sdk";

const sdk = new SDK({ host: "sandbox.customer.com", site: "my-site" });
```

You can then call various SDK APIs on the instance as shown in the examples below. It's also possible to configure multiple instances of `SDK` in order to connect to other (e.g., partner) sandboxes and/or reference other configured web site slug IDs.

Note that all SDK communication with Optable sandboxes is done over TLS. The only exception to this is if you instantiate the `SDK` class with the `insecure` optional boolean parameter set to `true`. For example:

```js
const sdk = new SDK({ host: "sandbox.customer.com", site: "my-site", insecure: true });
```

However, since production sandboxes only listen to TLS traffic, the above is really only useful for developers of `optable-sandbox` running the sandbox locally for testing. See [developer docs](https://github.com/Optable/optable-web-sdk/tree/master/docs) for other developer notes.

### Identify API

To associate a user's browser with an authenticated identifier such as an Email address, optionally linked with other identifiers, such as your own vendor, publisher, or site-level `PPID`, you can call the `identifyWithEmail` API as follows:

```js
const onSuccess = () => console.log("Identify API success!");
const onFailure = (err) => console.warn("Identify API error: ${err.message}");

const email = "some.email@address.com";

// Identify with Email:
sdk.identifyWithEmail(email).then(onSuccess).catch(onFailure);

// You can optionally link it with your own PPID in the same sandbox identification call:
const ppid = "some.ppid";
sdk.identifyWithEmail(email, ppid).then(onSuccess).catch(onFailure);
```

The SDK `identifyWithEmail()` method will asynchronously connect to the configured sandbox and send IDs for resolution.

> :warning: **Client-Side Email Hashing**: The SDK will compute the SHA-256 hash of the Email address on the client-side and send the hashed value to the sandbox. The Email address is **not** sent by the browser in plain text.

The frequency of invocation of `identifyWithEmail` is up to you, however for optimal identity resolution we recommended to call the `identifyWithEmail()` method on your SDK instance on each page load while the user is authenticated, or periodically such as for example once every 15 to 60 minutes while the user is authenticated and actively using your site.

### Targeting API

To get the targeting key values associated by the configured sandbox with the user's browser in real-time, you can call the targeting API as follows:

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

### Witness API

To send real-time event data from the user's browser to the sandbox for eventual audience assembly, you can call the witness API as follows:

```js
const onSuccess = () => console.log("Witness API success!");
const onFailure = (err) => console.warn("Witness API error: ${err.message}");

const eventProperties = {
  property_one: "some_value",
  property_two: "some other value",
};

sdk.witness("event.type.here", eventProperties).then(onSuccess).catch(onFailure);
```

The specified event type and properties are associated with the logged event and which can be used for matching during audience assembly.

Note that event properties are string keyvalue pairs and have type `WitnessProperties`:

```typescript
type WitnessProperties = {
  [key: string]: string;
};
```

## Usage (script tag)

For each [SDK release](https://github.com/Optable/optable-web-sdk/releases), a webpack generated browser bundle targeting the browsers list described by `npx browserslist "> 0.25%, not dead"` can be loaded on a web site via a `script` tag. As previously mentioned, your sandbox is configured to serve such a released browser bundle via the `https://sandbox.customer.com/static/web/sdk.js` URL by default.

As described in the **Installation** section above, in order to avoid having to block the rendering of the page, the recommended way to load the SDK via `script` tag is asynchronously with the `async` attribute. Therefore, to use the SDK you should take care to `push` your _commands_ onto the `window.optable.cmd` array of functions, which are automatically executed by the SDK browser bundle once it has loaded.

The browser bundle exports the same `SDK` constructor documented in the **npm module** section above in a `optable` window object, as `optable.SDK`

The following shows an example of how to safely initialize the SDK and dispatch an `identify` API request to a sandbox, from an input element after the document was loaded.

```html
<!-- Asynchronously load the SDK as early as possible: -->
<script async src="https://sandbox.customer.com/static/web/sdk.js"></script>

<!-- Later in the page: -->
<script>
  // Setup stub that will get replaced once the SDK get loaded
  window.optable = window.optable || { cmd: [] };

  optable.cmd.push(() => {
    // At this point optable.SDK is available and can be used to create a new sdk instance.
    // That instance can be stored anywhere for later referencing.
    // One option is to keep it within the global optable object space.
    optable.instance = new optable.SDK({ host: "sandbox.customer.com", site: "my-site" });
  });

  // Now configure DOM content loaded event listener to dispatch identify() API:
  window.addEventListener("DOMContentLoaded", (event) => {
    optable.cmd.push(() => {
      // Fetch input on document load
      const emailInput = document.getElementById("email");

      optable.instance.identifyByEmail(emailInput.value).then(() => console.log("Identify API Success!"));
    });
  });
</script>

<input type="text" id="email" value="some.email@address.com" />
```

## Integrating GAM360

Loading the Optable SDK via a `script tag` on a web page which also uses the [Google Publisher Tag](https://developers.google.com/doubleclick-gpt/guides/get-started), we can further extend the `targeting` example from the **npm module** section above, to show an integration with a [Google Ad Manager 360](https://admanager.google.com/home/) ad server account:

```html
<!-- Optable SDK async load: -->
<script async src="https://sandbox.customer.com/static/web/sdk.js"></script>

<!-- Google Publisher Tag (GPT) async load: -->
<script async src="https://securepubads.g.doubleclick.net/tag/js/gpt.js"></script>

<!-- Optable SDK, GPT, and targeting data initialization: -->
<script>
  window.optable = window.optable || { cmd: [] };
  window.googletag = window.googletag || { cmd: [] };

  // Init Optable SDK via command:
  optable.cmd.push(function () {
    optable.instance = new optable.SDK({ host: "sandbox.customer.com", site: "my-site" });
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
  // Call Optable sandbox for targeting data and setup GPT page-level targeting, then
  // explicitly refresh GPT ads:
  optable.cmd.push(function () {
    optable.instance.targeting().then(function (result) {
      // Sets up page-level targeting in GAM360 GPT
      // and explicitly calls refresh() on googletag:
      window.googletag = window.googletag || { cmd: [] };
      googletag.cmd.push(function () {
        for (const [key, values] of Object.entries(result)) {
          googletag.pubads().setTargeting(key, values);
        }
        googletag.pubads().refresh();
      });
    });
  });

  googletag.cmd.push(() => {
    googletag.display(adSlot);
  });
</script>
```

A working example is available in the demo pages.

## Demo Pages

The demo pages are working examples of both `identify` and `targeting` APIs, as well as an integration with the [Google Ad Manager 360](https://admanager.google.com/home/) ad server, enabling the targeting of ads served by GAM360 to audiences activated in the [Optable](https://optable.co/) sandbox.

You can browse a recent (but not necessarily the latest) released version of the demo pages at [https://demo.optable.co/](https://demo.optable.co/). The source code to the demos can be found [here](https://github.com/Optable/optable-web-sdk/tree/master/demos). The demo pages will connect to the [Optable](https://optable.co/) demo sandbox at `sandbox.optable.co` and reference the web site slug `web-sdk-demo`. The GAM360 targeting demo loads ads from a GAM360 account operated by [Optable](https://optable.co/).
