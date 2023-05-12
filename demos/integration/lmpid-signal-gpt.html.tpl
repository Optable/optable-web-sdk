<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Optable Web SDK Demos</title>
    <meta name="description" content="Optable Web SDK Demos" />
    <meta name="author" content="optable.co" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link href="//fonts.googleapis.com/css?family=Raleway:400,300,600" rel="stylesheet" type="text/css" />
    <link rel="stylesheet" href="/css/normalize.css" />
    <link rel="stylesheet" href="/css/skeleton.css" />
    <link rel="icon" type="image/png" href="/images/favicon.png" />

    <script async src="${SDK_URI}"></script>
    <script async src="https://securepubads.g.doubleclick.net/tag/js/gpt.js"></script>
  </head>
  <body>
    <div class="container">
      <div class="row">
        <div class="twelve column" style="margin-top: 5%;">
          <a href="/"><img src="/images/logo.png" width="200" /></a>
          <hr />
        </div>
      </div>
      <div class="row">
        <div class="twelve column">
          <h4>integration: Loblaw Media Private ID using GPT Secure Signals</h4>
        </div>
      </div>
      <div class="row">
        <div class="twelve column">
          <h4>Publisher Setup</h4>
          <p>
            As a publisher, integrating your DCN with Loblaw Media Private ID is a simple way to activate your inventory
            with higher accuracy than traditional cohort-based targeting while preserving your users' privacy.
            This guide shows how to setup your Optable DCN in order to send Private ID data to Loblaw Media.
          </p>

          <h5>Step 1</h5>
          <p>
            Contact your Optable account manager to request access to the Loblaw Media integration on your node.
            <br/>
            Once setup, the Loblaw Media partner will appear in the connected partners list.
          </p>

          <h5>Step 2</h5>
          <p>
            Create a Web SDK source in your node. <br/>
            Unlike normal cohort based targeting that you need to activate explicitly, Loblaw Media Private ID is enabled by default on all matched users with your Loblaw Media partner.
          </p>

          <h5>Step 3</h5>
          <p>
            In order to communicate Private ID's to Loblaw Media from your Web SDK source.<br/>
            Similarly to audience targeting, Private IDs are automatically passed down in edge targeting responses for all SDK sources.<br/> A convenience function <code>installGPTSecureSignals</code> must be used on the web SDK to install all secure signal sources handled by Optable's SDK.<br/>
            Note that this function uses targeting cache internally, which is why in the following example we propose to install the secure signal provider only once targeting cache as been populated.
          </p>
          <p>
          Example of a full integration snippet which configures GPT to send requests to GAM including Loblaw Media Private IDs as secure signal:

            <pre><code style="padding: 20px">// Setup both Optable and GPT SDKs.
window.optable = window.optable || { cmd: [] };
window.googletag = window.googletag || { cmd: [] };

// When optable SDK is loaded, initialize it, update targeting data, and install its GPT Secure Signals provider.
optable.cmd.push(function () {
  optable.instance = new optable.SDK({
    host: "{MY_NODE_HOST}",
    site: "{MY_NODE_ORIGIN}"
  });

  // Update cached targeting, then install Loblaw Media Private ID secure signal provider.
  optable.instance.targeting().then(() => {
    optable.instance.installGPTSecureSignals();
  });
});

// Define some Ad slots and request bids through Prebid.js.
googletag.cmd.push(function() {
  googletag
    .defineSlot('/my/slot', [[728, 90]], "ad")
    .addService(googletag.pubads());

  googletag.pubads().enableSingleRequest();
  googletag.enableServices();
});

...

// Display
googletag.cmd.push(function() {
  googletag.display('ad'); });
})
</code></pre>
          </p>
          <h4>Try it!</h4>
          <p>
            This demo page is setup so that the following random emails are generating Private ID requests.
            <br/>Make sure to <a target="_blank" id="identify-link">Identify</a> using one of the following identifiers.

            <pre><code style="padding: 20px">e:da1fead79be2dd0fc0450bc6e8157cb42f5289261b3d829108395dd8454056d6
e:a14918ffa4c3e90b81153fa78eae2175161ac6741bf0ce91e529a22c18d309c3
e:0336cbdb1a44e26276b48fee0c70d25bf0f6adeca86642a4d0b084190de7027a
e:76ee2b2bd51c3fad442f5355f26e0224c7c5a96cee8272aa87830da347db1313
e:31d6da0fbac2e5039646b8817ea50a3dae26537de7cb833b6e759eba779fcc5d
e:58e9f67ed2711bf874bfc19615d2d0cb9aca9200515513495f0d70475e9dc590
e:0bd4d8d8de86dd6bca2e096fbdd111c1ad87046b1df3240eb0eb8bf41c6d98a1
e:06e91979bf00a1a3b69d93f36d9488336689e769632346b853ca9f8a00f423b7
e:26283d3669f4edf35f17b98f5031277842ffb7547af81b7546d279b0934913ba
e:5d6d6ed5354f68d7523b7b39330145346209d20b06f5ed32373583823bac8d1a</code></pre>
          </p>
        </div>
      </div>
    </div>

    <div class="container">
      <div class="row">
        <div class="twelve column">
          <h5>web-sdk-demo-securesignals/header-ad</h5>
          <!-- /22081946781/web-sdk-demo-securesignals/header-ad -->
          <div id='div-gpt-ad-1682350431454-0' style='min-width: 728px; min-height: 90px;'>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="twelve column" style="margin-top: 2%;">
          <h5>web-sdk-demo-securesignals/box-ad</h5>
          <!-- /22081946781/web-sdk-demo-securesignals/box-ad -->
          <div id='div-gpt-ad-1682350702718-0' style='min-width: 200px; min-height: 200px;'>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="twelve column" style="margin-top: 2%;">
          <h5>web-sdk-demo-securesignals/footer-ad</h5>
          <!-- /22081946781/web-sdk-demo-securesignals/footer-ad -->
          <div id='div-gpt-ad-1682350744052-0' style='min-width: 728px; min-height: 90px;'>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="twelve column" style="font-size: 0.8rem; padding: 10px;">
          <center>
            <a href="https://www.optable.co/">Home</a> | <a href="https://www.optable.co/company/contact">Contact</a> |
            <a href="https://optable.co/privacy">Privacy</a> |
            <a href="https://www.linkedin.com/company/optableco/">LinkedIn</a> |
            <a href="https://twitter.com/optable_co">Twitter</a>
          </center>
        </div>
      </div>
      <script>
        window.optable = window.optable || { cmd: [] };
        window.googletag = window.googletag || { cmd: [] };

        optable.cmd.push(function () {
          optable.instance = new optable.SDK({
            host: "${SANDBOX_HOST}",
            site: "web-sdk-demo",
            insecure: JSON.parse("${SANDBOX_INSECURE}"),
            cookies: (new URLSearchParams(window.location.search)).get("cookies") === "yes",
          });
          optable.instance.targeting().then(() => {
            optable.instance.installGPTSecureSignals();
          });
        });

        googletag.cmd.push(function() {
          googletag
            .defineSlot('/22081946781/web-sdk-demo-securesignals/header-ad', [728, 90], 'div-gpt-ad-1682350431454-0')
            .addService(googletag.pubads());

          googletag
            .defineSlot('/22081946781/web-sdk-demo-securesignals/box-ad', [[250, 250], [300, 250], [200, 200]], 'div-gpt-ad-1682350702718-0')
            .addService(googletag.pubads());

          googletag
            .defineSlot('/22081946781/web-sdk-demo-securesignals/footer-ad', [728, 90], 'div-gpt-ad-1682350744052-0')
            .addService(googletag.pubads());

          googletag.pubads().enableSingleRequest();
          googletag.enableServices();

          googletag.display('div-gpt-ad-1682350431454-0');
          googletag.display('div-gpt-ad-1682350702718-0');
          googletag.display('div-gpt-ad-1682350744052-0');
        });
      </script>
    </div>
  </body>
</html>
