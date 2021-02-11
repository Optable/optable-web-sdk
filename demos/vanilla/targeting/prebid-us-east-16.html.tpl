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

    <!-- Prebid.js lib: -->
    <script async src="prebid-us-east-16.js"></script>

    <!-- GPT header tag start -->
    <script async src="https://securepubads.g.doubleclick.net/tag/js/gpt.js"></script>

    <!-- Optable web-sdk loader start -->
    <script type="text/javascript">
      window.optable = window.optable || { cmd: [] };

      optable.cmd.push(function () {
        optable.instance = new optable.SDK({
          host: "${SANDBOX_HOST}",
          site: "web-sdk-demo",
          insecure: JSON.parse("${SANDBOX_INSECURE}"),
        });

        optable.instance.tryIdentifyFromParams();
      });
    </script>
    <script async src="${SDK_URI}"></script>
    <!-- Optable web-sdk loader end -->

    <script>
      // Hook GPT event listeners and send events to sandbox:
      optable.cmd.push(function () {
        optable.instance.installGPTEventListeners();
      });

      // Try to fetch and cache targeting data from sandbox:
      optable.cmd.push(function () {
        optable.instance.targeting().catch((err) => {
          console.log("[OptableSDK] targeting() exception: " + err.message);
        });
      });

      // Set up GPT:
      window.googletag = window.googletag || { cmd: [] };
      googletag.cmd.push(function () {
        googletag.pubads().disableInitialLoad();
      });

      // Set up pbjs:
      window.pbjs = window.pbjs || { que: [] };

      //
      // Initialize pbjs and GPT:
      //
      var PREBID_TIMEOUT = 3000;
      var FAILSAFE_TIMEOUT = 5000;

      var bannerSizes = {
        "/22081946781/web-sdk-demo-gam360/header-ad": [[728, 90]],
        "/22081946781/web-sdk-demo-gam360/box-ad": [
          [250, 250],
          [300, 250],
          [200, 200],
        ],
        "/22081946781/web-sdk-demo-gam360/footer-ad": [[728, 90]],
      };

      var adUnits = [
        {
          code: "/22081946781/web-sdk-demo-gam360/header-ad",
          mediaTypes: {
            banner: {
              sizes: bannerSizes["/22081946781/web-sdk-demo-gam360/header-ad"],
            },
          },
          bids: [
            {
              bidder: "districtmDMX",
              params: {
                dmxid: "/22081946781/web-sdk-demo-gam360/header-ad",
                memberid: "102034",
              },
            },
          ],
        },
        {
          code: "/22081946781/web-sdk-demo-gam360/box-ad",
          mediaTypes: {
            banner: {
              sizes: bannerSizes["/22081946781/web-sdk-demo-gam360/box-ad"],
            },
          },
          bids: [
            {
              bidder: "districtmDMX",
              params: {
                dmxid: "/22081946781/web-sdk-demo-gam360/box-ad",
                memberid: "102034",
              },
            },
          ],
        },
        {
          code: "/22081946781/web-sdk-demo-gam360/footer-ad",
          mediaTypes: {
            banner: {
              sizes: bannerSizes["/22081946781/web-sdk-demo-gam360/footer-ad"],
            },
          },
          bids: [
            {
              bidder: "districtmDMX",
              params: {
                dmxid: "/22081946781/web-sdk-demo-gam360/footer-ad",
                memberid: "102034",
              },
            },
          ],
        },
      ];

      function initAdserver() {
        if (pbjs.initAdserverSet) return;
        pbjs.initAdserverSet = true;

        googletag.cmd.push(function () {
          pbjs.setTargetingForGPTAsync && pbjs.setTargetingForGPTAsync();

          // Setup page-level GAM targeting from any cached targeting data, and load GAM ads:
          optable.cmd.push(function () {
            const tdata = optable.instance.targetingFromCache();

            if (tdata) {
              for (const [key, values] of Object.entries(tdata)) {
                googletag.pubads().setTargeting(key, values);
                console.log("[OptableSDK] googletag.pubads().setTargeting(" + key + ", [" + values + "])");
              }
            }

            googletag.pubads().refresh();
            console.log("[OptableSDK] googletag.pubads().refresh()");
          });
        });
      }

      pbjs.que.push(function () {
        optable.cmd.push(function () {
          const pbdata = optable.instance.prebidUserDataFromCache();
          if (pbdata.length > 0) {
            pbjs.setConfig({ fpd: { user: { data: pbdata } } });
            console.log("[OptableSDK] pbjs.setConfig({ fpd: ... })");
          }

          pbjs.setConfig({
            priceGranularity: "low",
            userSync: {
              iframeEnabled: true,
              enabledBidders: ["districtmDMX"],
            },
          });
          pbjs.addAdUnits(adUnits);
          pbjs.requestBids({
            bidsBackHandler: initAdserver,
            timeout: PREBID_TIMEOUT,
          });
          console.log("[OptableSDK] pbjs.requestBids(...)");
        });
      });

      setTimeout(function () {
        initAdserver();
      }, FAILSAFE_TIMEOUT);

      // GPT define ad slots:
      googletag.cmd.push(function () {
        headerAd = googletag
          .defineSlot(
            "/22081946781/web-sdk-demo-gam360/header-ad",
            bannerSizes["/22081946781/web-sdk-demo-gam360/header-ad"],
            "div-gpt-ad-1598295788551-0"
          )
          .addService(googletag.pubads());
        boxAd = googletag
          .defineSlot(
            "/22081946781/web-sdk-demo-gam360/box-ad",
            bannerSizes["/22081946781/web-sdk-demo-gam360/box-ad"],
            "div-gpt-ad-1598295897480-0"
          )
          .addService(googletag.pubads());
        footerAd = googletag
          .defineSlot(
            "/22081946781/web-sdk-demo-gam360/footer-ad",
            bannerSizes["/22081946781/web-sdk-demo-gam360/footer-ad"],
            "div-gpt-ad-1598296001655-0"
          )
          .addService(googletag.pubads());

        googletag.pubads().enableSingleRequest();
        googletag.enableServices();

        console.log("[OptableSDK] googletag.enableServices()");
      });
    </script>
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
          <h4>Example: targeting &amp; Prebid.js activation</h4>
          <p>
            Shows how to load active cohorts for a visitor and pass them to Prebid.js via
            <a href="https://docs.prebid.org/dev-docs/publisher-api-reference.html#setConfig-fpd">setConfig-fpd</a>.
            It's assumed in this example that your primary ad server is
            <a href="https://admanager.google.com/home/">Google Ad Manager</a> (GAM) and that you are integrated with it
            using the
            <a href="https://developers.google.com/publisher-tag/guides/get-started">Google Publisher Tag</a> (GPT), so
            we also pass matching active cohorts to GAM.
          </p>
          <p>
            In this example, we use the <code>targetingFromCache</code> API to retrieve any targeting data from browser
            LocalStorage, in order to pass it to both Prebid.js and GPT. We also call the SDK <code>targeting</code> API
            which will fetch the latest targeting data from our sandbox and cache it locally for later use. Since these
            two events happen asynchronously, it's possible that the targeting data passed to GAM is slightly outdated.
            To ensure ad targeting accuracy, we recommend calling <code>targeting</code> to update the local cache on
            every page load.
          </p>
        </div>
      </div>

      <div class="row">
        <div class="twelve column">
          <h5>web-sdk-demo-gam360/header-ad</h5>
          <!-- GAM360 Ad Unit slot: web-sdk-demo-gam360/header-ad -->
          <div id="div-gpt-ad-1598295788551-0" style="width: 728px; height: 90px;"></div>
        </div>
      </div>
      <div class="row">
        <div class="twelve column" style="margin-top: 2%;">
          <h5>web-sdk-demo-gam360/box-ad</h5>
          <!-- GAM360 Ad Unit slot: web-sdk-demo-gam360/box-ad -->
          <div id="div-gpt-ad-1598295897480-0"></div>
        </div>
      </div>
      <div class="row">
        <div class="twelve column" style="margin-top: 2%;">
          <h5>web-sdk-demo-gam360/footer-ad</h5>
          <!-- GAM360 Ad Unit slot: web-sdk-demo-gam360/footer-ad -->
          <div id="div-gpt-ad-1598296001655-0"></div>
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

    <!-- GPT body tag start -->
    <script>
      googletag.cmd.push(function () {
        googletag.display(headerAd);
        googletag.display(boxAd);
        googletag.display(footerAd);

        console.log("[OptableSDK] googletag.display() all slots");
      });
    </script>
    <!-- GPT body tag end -->
  </body>
</html>
