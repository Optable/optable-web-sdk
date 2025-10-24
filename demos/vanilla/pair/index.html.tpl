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

    <!-- Optable web-sdk loader start -->
    <script type="text/javascript">
      window.optable = window.optable || { cmd: [] };
      const cookiesTransport = (new URLSearchParams(window.location.search)).get("cookies") === "yes"

      optable.cmd.push(function () {
        optable.instance = new optable.SDK({
          host: "${DCN_HOST}",
          initPassport: JSON.parse("${DCN_INIT}"),
          site: "${DCN_SITE}",
          node: "${DCN_NODE}",
          cookies: cookiesTransport,
        });
      });
    </script>
    <script async src="${SDK_URI}"></script>
    <!-- Optable web-sdk loader end -->

    <!-- Prebid.js and GAM setup start -->
    <script async src="//www.googletagservices.com/tag/js/gpt.js"></script>
    <script async src="prebid.js"></script>
    <script>
      const searchParams = new URLSearchParams(window.location.search);
      const slotID = searchParams.get("slot") ?? "/22081946781/web-sdk-demo-gam360"
      var bannerSizes = [[300, 250]];

      var googletag = googletag || {};
      googletag.cmd = googletag.cmd || [];

      var pbjs = pbjs || {};
      pbjs.que = pbjs.que || [];

      // Configure Prebid.js with Open Pair ID module
      pbjs.que.push(function() {
        pbjs.bidderSettings = {
          appnexus: {
            storageAllowed: true,
          }
        };

        pbjs.mergeConfig({
          userSync: {
            userIds: [
              {
                name: 'openPairId',
                inserter: window.location.hostname,
                matcher: 'optable.co',
                params: {
                  optable: { storageKey: '_optable_pairId' }
                },
              },
            ]
          }
        });

        // Define ad units
        pbjs.addAdUnits({
          code: slotID,
          mediaTypes: { banner: { sizes: bannerSizes } },
          bids: [{
            bidder: 'appnexus',
            params: {
              placementId: "placementid",
            }
          }]
        });

        // Configure GAM slot
        googletag.cmd.push(function() {
          googletag.pubads().disableInitialLoad();
          googletag.defineSlot(slotID, bannerSizes, "div-ad")
            .addService(googletag.pubads());
          googletag.pubads().enableSingleRequest();
          googletag.enableServices();

          // Request bids and handle response
          pbjs.requestBids({
            bidsBackHandler: function(bidResponses) {
              pbjs.setTargetingForGPTAsync();
              googletag.pubads().refresh();
            },
          });
        });
      });
    </script>
    <!-- Prebid.js and GAM setup end -->
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
          <h4>Example: Open Pair ID Integration</h4>
          <p>
            Shows how to integrate the Optable Web SDK with Prebid.js using the <a href="https://docs.prebid.org/dev-docs/modules/userid-submodules/open-pair">Open PAIR user module</a> to automatically transmit Optable's cleanroom <a href="https://iabtechlab.com/pair/">PAIR</a> IDs in the bid stream.
          </p>
          <p>
            This integration is ideal for publishers who only need to transmit PAIR IDs in the bid stream. With the following userId module configuration, PAIR IDs are read automatically from where Optable SDK's stores them. Those are automatically refreshed when <code>targeting()</code> is called on the SDK instance. No additional setup is required.
          </p>
        </div>
      </div>

      <div class="row">
        <div class="twelve column">
          <h5>Prebid.js Configuration</h5>
          <pre><code>pbjs.mergeConfig({
  userSync: {
    userIds: [
      {
        name: 'openPairId',
        inserter: window.location.hostname,
        matcher: 'optable.co',
        params: {
          optable: { storageKey: '_optable_pairId' }
        },
      },
    ]
  }
});</code></pre>
        </div>
      </div>

      <div class="row">
        <div class="twelve column">
          <h5>Demo Ad Slot</h5>
          <div id="div-ad" style="width: 300px; height: 250px; border: 1px black dotted">
          </div>
        </div>
      </div>

      <div class="row">
        <div class="twelve column" style="font-size: 0.8rem; padding: 10px;">
          <center>
            <a href="https://www.optable.co/">Home</a> | <a href="https://www.optable.co/company/contact">Contact</a> |
            <a href="https://terms.optable.co/">Terms</a> |
            <a href="https://www.linkedin.com/company/optableco/">LinkedIn</a> |
            <a href="https://twitter.com/optable_co">Twitter</a>
          </center>
        </div>
      </div>
    </div>
  </body>
</html>
