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
    <script async src="prebid.js"></script>

    <!-- GPT header tag start -->
    <script async src="https://securepubads.g.doubleclick.net/tag/js/gpt.js"></script>

    <!-- Optable web-sdk loader start -->
    <script type="text/javascript">
      window.optable = window.optable || { cmd: [] };

      optable.cmd.push(function () {
        optable.instance = new optable.SDK({
          host: "${DCN_HOST}",
          initPassport: JSON.parse("${DCN_INIT}"),
          site: "${DCN_SITE}",
          cookies: false,
          node: "${DCN_NODE}",
          initTargeting: true,
        });

        optable.instance.tryIdentifyFromParams();

        // Create a ref for RTD module to use SDK.
        optable.prebid_instance = optable.instance;
      });
    </script>
    <script async src="${SDK_URI}"></script>
    <!-- Optable web-sdk loader end -->

    <script>
      // Hook GPT event listeners and send events to DCN:
      optable.cmd.push(function () {
        optable.instance.installGPTEventListeners();
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
            bidder: "pubmatic",
            params: {
              publisherId: "156209",              // Example: PubMatic test publisher ID
            }
          }
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
            bidder: "pubmatic",
            params: {
              publisherId: "156209",
            }
          }
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
            bidder: "pubmatic",
            params: {
              publisherId: "156209",
            }
          }
        ],
      }
    ];

      function initAdserver() {
        if (pbjs.initAdserverSet) return;
        pbjs.initAdserverSet = true;

        const disableGamTargeting = localStorage.getItem("disableGamTargeting") === "true";
        console.log("[OptableSDK] Reading 'disableGamTargeting' from localstorage: " + disableGamTargeting);

        googletag.cmd.push(function () {
            if (disableGamTargeting) {
            console.log("[OptableSDK] Skipping pbjs.setTargetingForGPTAsync() because disableGamTargeting is set to true");
            } else {
            pbjs.setTargetingForGPTAsync && pbjs.setTargetingForGPTAsync();
            console.log("[OptableSDK] pbjs.setTargetingForGPTAsync()");
            }
            googletag.pubads().refresh();
        });
      }

      pbjs.que.push(function () {
        optable.cmd.push(function () {
          pbjs.mergeConfig({
            debug: true,
            priceGranularity: "low",
            userSync: {
              iframeEnabled: true,
              enabledBidders: ["pubmatic"],
            },
            realTimeData: {
              auctionDelay: 400,
              dataProviders: [
                {
                  name: 'optable',
                  waitForIt: true, // should be true, otherwise the auctionDelay will be ignored
                },
              ],
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
          <a href="/index-nocookies.html"><img src="/images/logo.png" width="200" /></a>
          <hr />
        </div>
      </div>

      <div class="row">
        <div class="twelve column">
          <h4>Prebid.js Integration with OptableRTD</h4>

          <h5>Overview</h5>
          <p>
            This demo demonstrates how to integrate Optable's targeting capabilities with Prebid.js using the
            <a href="https://docs.prebid.org/dev-docs/modules/optableRtdProvider.html">OptableRTD module</a>.
            The implementation assumes Google Ad Manager (GAM) as the primary ad server, integrated via
            <a href="https://developers.google.com/publisher-tag/guides/get-started">Google Publisher Tag (GPT)</a>.
          </p>

          <h5>Key Features</h5>
          <ul>
            <li>Loads active visitor cohorts and passes them to Prebid.js via OptableRTD</li>
            <li>Automatically forwards matching cohorts to GAM for targeting</li>
            <li>Supports local cache updates for improved targeting accuracy</li>
            <li>Configurable GAM targeting override via localStorage</li>
          </ul>

          <h5>Implementation</h5>
          <p>
            The Prebid.js configuration requires minimal setup. Here's the essential configuration:
          </p>
          <pre><code>pbjs.mergeConfig({
  debug: true,
  priceGranularity: "low",
  userSync: {
    iframeEnabled: true,
    enabledBidders: ["pubmatic"]
  },
  realTimeData: {
    auctionDelay: 400,
    dataProviders: [{
      name: 'optable',
      waitForIt: true  // Required to respect auctionDelay
    }]
  }
});</code></pre>

          <h5>Important Notes</h5>
          <ul>
            <li>
              <strong>Targeting Cache:</strong> For optimal targeting accuracy, call <code>targeting</code>
              on page load to update the local cache, as the RTD module only uses cached values.
            </li>
            <li>
              <strong>GAM Targeting Override:</strong> Set <code>localStorage.disableGamTargeting = "true"</code>
              before page load to prevent the SDK from sending targeting data to GAM.
            </li>
          </ul>
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
            <a href="https://terms.optable.co/">Terms</a> |
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
