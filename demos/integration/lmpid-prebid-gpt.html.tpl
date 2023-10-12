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
    <script async src="prebid.js"></script>
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
          <h4>Loblaw Media Private ID (LM PID) with Prebid.js and GPT Secure Signals</h4>
        </div>
      </div>
      <div class="row">
        <div class="twelve column">
          <p>
            The
            <a target="_blank" rel="noopener" href="https://github.com/Optable/optable-web-sdk">Optable SDK</a>
            enables easy deployment of the
            <a target="_blank" rel="noopener" href="https://www.loblawmedia.ca/">Loblaw Media</a>
            Private ID (LM PID).
            The LM PID is generated automatically for all identified users successfully matched with
            Loblaw Media. LM PID is a secure token that contains information on matched users
            that is computed within the Optable data clean room environment. It enables the
            <a target="_blank" rel="noopener" href="https://www.loblawmedia.ca/discover-mediaaisle">Loblaw Media DSP (MediaAisle)</a>
            to target, control ad exposure frequency, and measure the
            effectiveness of Loblaw Media advertisements to identified, authenticated, and consented publisher users.
          </p>
          <p>
            This demo page shows an integration of LM PID deployed via Optable, with both Prebid.js
            (including Loblaw Media's bidder adapter and user ID modules), and with
            <a href="https://developers.google.com/publisher-tag/guides/get-started">Google Publisher Tag (GPT)</a>
            and
            <a href="https://admanager.google.com/home/">Google Ad Manager (GAM)</a>
            <a href="https://support.google.com/admanager/answer/10488752?hl=en">Secure Signals</a>.
            Whenever possible,
            it is recommended that both methods are enabled together as shown in this demo page, such that
            the likelihood of MediaAisle bidding is maximised.
          </p>

          <h5>Step 1: Request access</h5>
          <p>
            Contact your Optable account manager to request access to the Loblaw Media Private ID
            framework integration. Once configured and enabled, the Loblaw Media partner
            will appear connected in the <strong>partnerships</strong> section of the Optable user interface.
          </p>
          <p>
            Please note that Steps 2-4 below should be repeated for each web site that you would like to enable
            LM PID on.
          </p>

          <h5>Step 2: Create a Javascript SDK source</h5>
          <p>
            If your web site is not already represented by a <strong>source</strong> in your Optable
            Data Collaboration Node (DCN), create a
            <a target="_blank" rel="noopener" href="https://docs.optable.co/optable-documentation/integrations/sources/sdk-sources/javascript-sdk">Javascript SDK source</a>
            and note its
            unique <i>slug</i> identifier, as well as the hostname of your DCN, as these will be required
            for Optable SDK integration (see Step 3).
          </p>
          <p>
            LM PID will be returned by your Optable DCN for all matched users associated with
            activation clean rooms originating from the Loblaw Media partner.
          </p>

          <h5>Step 3: Deploy the Optable SDK to your site</h5>
          <p>
            If you haven't already deployed the Optable SDK to your web site, have a look at the
            <a target="_blank" rel="noopener" href="https://github.com/Optable/optable-web-sdk#installing">Optable SDK README</a>. There are two SDK APIs which you must deploy in order to integrate LM PID:
            <a target="_blank" rel="noopener" href="https://github.com/Optable/optable-web-sdk#identify-api">identify</a>
            and
            <a target="_blank" rel="noopener" href="https://github.com/Optable/optable-web-sdk#targeting-api">targeting</a>.
          </p>
          <p>
            The <code>identify</code> API enables you to associate a user's browser with a known identifier, such
            as an email address or a publisher assigned user ID. Since Loblaw Media activation matches operate on a
            combination of email address, phone number, and mobile advertising IDs, it is recommended that you
            <code>identify</code> consenting users with all of that user's known and consented ad IDs.
            You can do this by calling
            <code>identify</code> with additional identifiers directly from your web site, or by calling
            it with a single publisher assigned user ID, and then separately loading identity mappings
            (associated with the publisher assigned user ID) via any
            <a target="_blank" rel="noopener" href="https://docs.optable.co/optable-documentation/integrations/sources">supported sources</a>.
          </p>
          <p>
            The <code>targeting</code> API retrieves targeting data, including the LM PID when available,
            and stores it in browser local storage for subsequent retrieval.
          </p>

          <h5>Step 4: Prebid.js and GPT integrations</h5>
          <p>
            For Prebid.js installations, you must make sure to include the <code>mabidder</code> bidder adapter and
            the <code>lmpid</code> user ID module. Note that you must include <code>mabidder</code> in the
            <code>addAdUnits()</code> call.
            See
            <a target="_blank" rel="noopener" href="https://docs.prebid.org/download.html">Prebid.js download instructions</a>
            and
            <a target="_blank" rel="noopener" href="https://docs.prebid.org/dev-docs/modules/userId.html#user-id-sub-modules">Prebid.js user ID modules</a>
            for details.
          </p>
          <p>
            For Google Publisher Tag (GPT), you must call the <code>installGPTSecureSignals()</code> API
            shortly after Optable SDK instantiation. This API will configure GPT to pass <code>lmpid</code>
            to Google Ad Manager (GAM), when it is available in browser local storage.
          </p>
          <p>
            Try to call the Optable SDK <code>targeting()</code> API as early as possible. This API will
            retrieve the latest <code>lmpid</code>, when it is enabled and available for the current user,
            and store it in browser local storage for retrieval by both Prebid.js and GPT as previously described.
          </p>

          <h5>Prebid.js and GPT integration example</h5>
          <p>
            While the <code>lmpid</code> user ID module passes the Loblaw Media Private ID to the
            Loblaw Media bidder (mabidder), the <code>installGPTSecureSignals()</code> API in Optable's
            Javascript SDK exposes it to Google Ad Manager via
            <a href="https://support.google.com/admanager/answer/10488752?hl=en">Secure Signals</a>.
            Please make sure to follow Google's instructions for enabling Secure Signals sharing on your websites.
          </p>
          <p>
            The code snippet below shows an example integration with both Prebid.js and GPT on page. Note
            that <code>{OPTABLE_DCN_HOST}</code> and <code>{OPTABLE_DCN_SOURCE_SLUG}</code> must be replaced
            with your Optable Data Collaboration Node (DCN) hostname and Javascript SDK source slug, respectively.
          </p>
          <p>
            <pre><code style="padding: 20px">// Setup Optable, Prebid.js and GPT SDKs.
window.optable = window.optable || { cmd: [] };
window.googletag = window.googletag || { cmd: [] };
window.pbjs = window.pbjs || { que: [] };

// When optable SDK is loaded, initialize it and install GPT Secure Signals provider.
optable.cmd.push(function () {
  optable.instance = new optable.SDK({
    host: "{OPTABLE_DCN_HOST}",
    site: "{OPTABLE_DCN_SOURCE_SLUG}",
  });

  optable.instance.installGPTSecureSignals();
  optable.instance.targeting();
});

// Disable initial GPT load, required for Prebid.js
googletag.cmd.push(function () {
  googletag.pubads().disableInitialLoad();
});

// When prebid SDK is loaded, configure it to use LMPID user ID module and
// request bids for the defined ad units.

pbjs.que.push(function () {
  // Enable Loblaw Media Private ID user ID module (lmpid):
  pbjs.setConfig({ userSync: { userIds: [{ name: "lmpid" }] } })

  // Configure some ad units.
  // Note that while it's not relevant for LMPID integration,
  // Loblaw Media's prebid ad server currently requires passing a ppid.
  pbjs.addAdUnits([{
    code: "/my/slot", // must match the defined ad slots below
    mediaTypes: { banner: { sizes: [[728, 90]] } },
    bids: [{ bidder: "mabidder", params: { ppid: "{MY_PPID}" }}],
  }]);

  // Define some slots
  googletag.cmd.push(function() {
    googletag
      .defineSlot("/my/slot", [[728, 90]], "ad")
      .addService(googletag.pubads());

    googletag.pubads().enableSingleRequest();
    googletag.enableServices();

    googletag.display("ad");

    // Request bids through Prebid.js.
    pbjs.requestBids({
      bidsBackHandler: function() {
        // Set targeting in matching GPT ad slots
        pbjs.setTargetingForGPTAsync();

        // Request ads
        googletag.pubads().refresh();
      },
    });
  });
});
</code></pre>
          </p>

          <h4>Try it!</h4>
          <p>
            This demo page is setup so that the following random emails are generating LM PID requests.
          </p>
          <p>
            To trigger LM PID insertion in ad requests, you must first
            <a target="_blank" id="identify-link">identify</a> using one of the following test email identifiers:

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
    </div>
    <script type="text/javascript">
      const cookiesTransport = (new URLSearchParams(window.location.search)).get("cookies") === "yes"
      document.getElementById("identify-link").href = cookiesTransport ?
        "/vanilla/identify.html" : "/vanilla/nocookies/identify.html";
    </script>
    <script type="text/javascript">
      window.optable = window.optable || { cmd: [] };
      window.googletag = window.googletag || { cmd: []};
      window.pbjs = window.pbjs || { que: [] };

      optable.cmd.push(function () {
        optable.instance = new optable.SDK({
          host: "${SANDBOX_HOST}",
          initPassport: JSON.parse("${SANDBOX_INIT}"),
          site: "web-sdk-demo",
          insecure: JSON.parse("${SANDBOX_INSECURE}"),
          cookies: cookiesTransport,
        });

        optable.instance.installGPTSecureSignals();
        optable.instance.targeting();
      });

      googletag.cmd.push(function () {
        googletag.pubads().disableInitialLoad();
      });

      pbjs.que.push(function () {
        pbjs.setConfig({
          userSync: { userIds: [{ name: "lmpid" }] },
        });

        pbjs.addAdUnits([
          {
            code: "/22081946781/web-sdk-demo-securesignals/header-ad",
            mediaTypes: { banner: { sizes: [[728, 90]] } },
            bids: [{ bidder: "mabidder", params: { ppid: "ppid" } }],
          },
          {
            code: "/22081946781/web-sdk-demo-securesignals/box-ad",
            mediaTypes: { banner: { sizes: [[250, 250], [300, 250], [200, 200]] } },
            bids: [{ bidder: "mabidder", params: { ppid: "ppid" } }],
          },
          {
            code: "/22081946781/web-sdk-demo-securesignals/footer-ad",
            mediaTypes: { banner: { sizes: [[728, 90]] } },
            bids: [{ bidder: "mabidder", params: { ppid: "ppid" } }],
          },
        ]);

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

          pbjs.requestBids({
            bidsBackHandler: function() {
              pbjs.setTargetingForGPTAsync();
              googletag.pubads().refresh();
            },
          });
        });
      })
    </script>
  </body>
</html>
