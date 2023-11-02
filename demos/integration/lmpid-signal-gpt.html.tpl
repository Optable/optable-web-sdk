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
          <h4>Loblaw Media Private ID (LM PID) with GPT Secure Signals</h4>
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
            This demo page shows an integration of LM PID deployed via Optable, with the
            <a href="https://developers.google.com/publisher-tag/guides/get-started">Google Publisher Tag (GPT)</a>
            and
            <a href="https://admanager.google.com/home/">Google Ad Manager (GAM)</a>
            <a href="https://support.google.com/admanager/answer/10488752?hl=en">Secure Signals</a>.
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

          <h5>Step 4: GPT integration</h5>
          <p>
            You must call the <code>installGPTSecureSignals()</code> SDK API
            shortly after Optable SDK instantiation. This API will configure GPT to pass <code>lmpid</code>
            to Google Ad Manager (GAM), when it is available in browser local storage.
          </p>
          <p>
            Try to call the Optable SDK <code>targeting()</code> API as early as possible. This API will
            retrieve the latest <code>lmpid</code>, when it is enabled and available for the current user,
            and store it in browser local storage for retrieval by GPT as previously described.
          </p>

          <h5>Prebid.js and GPT integration example</h5>
          <p>
            The code snippet below shows an example integration with GPT on page. Note
            that <code>{OPTABLE_DCN_HOST}</code> and <code>{OPTABLE_DCN_SOURCE_SLUG}</code> must be replaced
            with your Optable Data Collaboration Node (DCN) hostname and Javascript SDK source slug, respectively.
          </p>
          <p>
            <pre><code style="padding: 20px">// Setup both Optable and GPT SDKs.
window.optable = window.optable || { cmd: [] };
window.googletag = window.googletag || { cmd: [] };

// When optable SDK is loaded, initialize it and install GPT Secure Signals provider.
optable.cmd.push(function () {
  optable.instance = new optable.SDK({
    host: "{OPTABLE_DCN_HOST}",
    site: "{OPTABLE_DCN_SOURCE_SLUG}",
  });

  optable.instance.installGPTSecureSignals();
  optable.instance.targeting()
});

// When GPT SDK is loaded, define and prepare an ad slot.
// Note that we disableInitialLoad() in order to defer the first ad request
// until secure signals are installed.
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
    googletag.pubads().refresh();
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
      <script>
        window.optable = window.optable || { cmd: [] };
        window.googletag = window.googletag || { cmd: [] };

        optable.cmd.push(function () {
          optable.instance = new optable.SDK({
            host: "${DCN_HOST}",
            initPassport: JSON.parse("${DCN_INIT}"),
            site: "${DCN_SITE}",
            insecure: JSON.parse("${DCN_INSECURE}"),
            cookies: (new URLSearchParams(window.location.search)).get("cookies") === "yes",
          });

          optable.instance.installGPTSecureSignals();
          optable.instance.targeting();
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
            googletag.pubads().refresh();
          })
        })
      </script>
    </div>
  </body>
</html>
