# Optable Web SDK [![buildkite](https://badge.buildkite.com/314d07ac4946d31b6fde7a7534a9f13ab72c8aedf761a7ed24.svg)](https://buildkite.com/optable/web-sdk-publish-tag)

Web SDK for integrating with optable-sandbox from a web application.
The Web SDK can be used as both a ES6 compatible NPM module paired with module bundlers such as Webpack or Browserify or can be installed on a webpage directly by referencing the browser build in a script tag.

## Install

### NPM

NPM is the recommended installation method when building large scale applications including Optable Web SDK. It pairs nicely with module bundlers such as Webpack or Browserify and expose typings for applications using Typescript type checker.

```shell
# latest stable
$ npm install @optable/web-sdk
```

### Direct script include

Simply download and include within a `<script>` tag.
For prototyping or learning purposes, you can use the latest version with:

```html
<script src="https://cdn.jsdelivr.net/npm/@optable/web-sdk@latest/browser/dist/sdk.js"></script>
```

For production, we recommend linking to a specific version number and build to avoid unexpected breakage from newer versions.

## Usage as a NPM module

To configure an instance of the SDK integrating with an [Optable](https://optable.co/) sandbox running at hostname `sandbox.customer.com`, from a configured application origin identified by slug `my-site`:

```js
import SDK from "@optable/web-sdk";

const sdk = new SDK({ host: "sandbox.customer.com", site: "my-site" });
```

You can then call various OptableSDK APIs on the instance as shown in the examples below. It's also possible to configure multiple instances of `SDK` in order to connect to other (e.g., partner) sandboxes and/or reference other configured application slug IDs.

### Identify API

To associate a user device with an authenticated identifier such as an Email address, optionally linked with other identifiers, such as your own vendor or site level `PPID`, you can invoke the `identifyWithEmail` API as follows:

```js
const onSuccess = () => console.log("Identify API success!");
const onFailure = (err) => console.warn("Identify API error: ${err.message}");

const email = "some.email@address.com";

// Only identify email
sdk.identifyWithEmail(email).then(onSuccess).catch(onFailure);

// You can optionally link it with vendor level PPID in the same sandbox identification call
const ppid = "some.ppid";
sdk.identifyWithEmail(email, ppid).then(onSuccess).catch(onFailure);
```

The SDK `identifyWithEmail()` method will asynchronously connect to the configured sandbox and send IDs for resolution.

Note that in the above example, the SDK will compute the SHA-256 hash of the Email address on the client-side and send the hashed value to the sandbox. The Email address is never sent from the device in plain text.

The frequency of invocation of `identifyWithEmail` is up to you, however for optimal identity resolution we recommended to call the `identifyWithEmail()` method on your SDK instance every time you authenticate a user, as well as periodically, such as for example once every 15 to 60 minutes while the application is being actively used and an internet connection is available.

### Targeting API

To get the targeting key values associated by the configured sandbox with the device in real-time, you can call the targeting API as follows:

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

## Usage as a direct script include

A webpack generated browser bundle targeting the browsers list described by `npx browserslist "> 0.25%, not dead"` is included in this NPM module and exposes the same `SDK` constructor documented above in a `optable` window object as `optable.SDK`.

The SDK can be intantiated either synchronously (directly after including/loading the script in a `<head>` for example),
or asynchronously to avoid having to block the rendering of the page.

More specifically, the SDK supports executing a stubbed `window.optable.cmd` array of functions to execute once it successfully loaded on the page.

Here is an example of initializing asynchronously the SDK and use it to send and identify request to a sandbox, from an input element after the document was loaded.

```html
<!-- Asynchronously load the SDK anywhere in the page. In production this is recommended to be loaded from your sandbox instance -->
<script async src="https://cdn.jsdelivr.net/npm/@optable/web-sdk@latest/browser/dist/sdk.js"></script>

<script>
  // Setup stub that will get replaced once the SDK get loaded
  window.optable = window.optable || { cmd: [] };

  optable.cmd.push(() => {
    // At this point optable.SDK is available and can be used to create a new sdk instance.
    // That instance can be stored anywhere for later referencing. One option is to keep it within the global optable object space.
    optable.instance = new optable.SDK({ host: "sandbox.customer.com", site: "my-site" });
  });

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

## Usage as a direct script include with GAM360 targeting

Here is a similar example of how to setup a google tag for publisher on a web page so that it injects custom key values
for targeting.

```html
<!-- Asynchronously load the SDK anywhere in the page. In production this is recommended to be loaded from your sandbox instance -->
<script async src="https://cdn.jsdelivr.net/npm/@optable/web-sdk@latest/browser/dist/sdk.js"></script>

<script type="text/javascript">
  window.optable = window.optable || { cmd: [] };

  optable.cmd.push(function () {
    optable.instance = new optable.SDK({ host: "sandbox.customer.com", site: "my-site" });
  });
</script>

<script>
  optable.cmd.push(function () {
    optable.instance.targeting().then(function (result) {
      // Sets up page-level targeting in GAM360 GPT:

      window.googletag = window.googletag || { cmd: [] };

      googletag.cmd.push(function () {
        // Inject targeting key values once both Google and Optable tag are loaded.

        for (const [key, values] of Object.entries(result)) {
          googletag.pubads().setTargeting(key, values);
          console.log("[OptableSDK] googletag.pubads().setTargeting(" + key + ", [" + values + "])");
        }

        googletag.pubads().refresh();
        console.log("[OptableSDK] googletag.pubads().refresh()");
      });
    });
  });
</script>

<!-- Google tag load and setup -->
<script async src="https://securepubads.g.doubleclick.net/tag/js/gpt.js"></script>
<script>
  window.googletag = window.googletag || { cmd: [] };

  googletag.cmd.push(() => {
    googletag
      .defineSlot(...)
      .addService(googletag.pubads())
  })
</script>

<!-- Google tag rendering -->
<script async src="https://securepubads.g.doubleclick.net/tag/js/gpt.js"></script>
<script>
  window.googletag = window.googletag || { cmd: [] };

  googletag.cmd.push(() => {
    googletag.display(...)
  })
</script>
```
