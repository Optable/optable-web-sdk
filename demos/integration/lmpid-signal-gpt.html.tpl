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

// When optable SDK is loaded, initialize it and install GPT Secure Signals provider.
optable.cmd.push(function () {
  optable.instance = new optable.SDK({
    host: "{MY_NODE_HOST}",
    site: "{MY_NODE_ORIGIN}"
  });

  // Install all secure signal providers (including LMPID).
  optable.instance.installGPTSecureSignals();
  // Refresh targeting page cache
  optable.instance.targeting()
});

// When GPT SDK is loaded, define and prepare an ad slot.
// Note that we disableInitialLoad() in order to defer the first ad request
// until secure signals are installed that we guarantee targeting cache is populated.
googletag.cmd.push(function() {
  googletag.pubads().disableInitialLoad();

  googletag
    .defineSlot('/my/slot', [[728, 90]], "ad")
    .addService(googletag.pubads());

  googletag.pubads().enableSingleRequest();
  googletag.enableServices();
  googletag.display("ad");
});

// Explicitly refresh ads when everything is loaded and the above setup is done.
googletag.cmd.push(function () {
  optable.cmd.push(function () {
    // Optionally we could move the targeting page cache refresh here,
    // and `then()` refresh to guarantee that the first ad call includes fresh targeting data.
    googletag.pubads().refresh();
  });
});
</code></pre>
          </p>
          <h4>Try it!</h4>
          <p>
            This demo page is setup so that the following random emails are generating Private ID requests.
            <br/>Make sure to <a target="_blank" id="identify-link">Identify</a> using one of the following email identifier.

            <pre><code style="padding: 20px">john.doe@acme.test
emily.smith@acme.test
alexander.wilson@acme.test
sarah.johnson@acme.test
david.thompson@acme.test
lisa.brown@acme.test
jason.miller@acme.test
jessica.wright@acme.test
matthew.harris@acme.test
olivia.anderson@acme.test</code></pre>
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
          optable.instance.installGPTSecureSignals();
        })

        googletag.cmd.push(function () {
          googletag.pubads().disableInitialLoad();

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
        })

        googletag.cmd.push(function () {
          optable.cmd.push(function () {
            optable.instance.targeting().then(function() {
              googletag.pubads().refresh();
            })
          })
        })
      </script>
    </div>
  </body>
</html>
