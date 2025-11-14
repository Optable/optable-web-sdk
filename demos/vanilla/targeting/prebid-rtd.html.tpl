<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Optable Web SDK Demos - RTD Module</title>
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
          node: "${DCN_NODE}",
        });

        optable.instance.tryIdentifyFromParams();
      });
    </script>
    <script async src="${SDK_URI}"></script>
    <!-- Optable web-sdk loader end -->

    <script>
      // Hook GPT event listeners and send events to DCN:
      optable.cmd.push(function () {
        optable.instance.installGPTEventListeners();
      });

      // Fetch and cache targeting data from DCN before initializing RTD:
      window.optableTargetingReady = new Promise((resolve) => {
        optable.cmd.push(function () {
          optable.instance.targeting()
            .then(() => {
              console.log("[OptableSDK] targeting() completed successfully");
              resolve();
            })
            .catch((err) => {
              console.log("[OptableSDK] targeting() exception: " + err.message);
              resolve(); // Resolve anyway so RTD can proceed
            });
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
            const tdata = optable.instance.targetingKeyValuesFromCache();

            if (tdata) {
              for (const [key, values] of Object.entries(tdata)) {
                googletag.pubads().setTargeting(key, values);
                console.log("[OptableSDK RTD] googletag.pubads().setTargeting(" + key + ", [" + values + "])");
              }
            }

            googletag.pubads().refresh();
            console.log("[OptableSDK RTD] googletag.pubads().refresh()");
          });
        });
      }

      pbjs.que.push(function () {
        // Wait for targeting data to be fetched and cached before using RTD module
        window.optableTargetingReady.then(function () {
          optable.cmd.push(function () {
            // Initialize the RTD module with configuration
            const rtdConfig = optable.utils.buildRTD({
              enableLogging: true,
              optableCacheTargeting: 'optable-cache:targeting',
              // You can customize merge strategies, filters, and routes here
              mergeStrategy: optable.utils.buildRTD().appendMergeStrategy,
            });

            console.log("[OptableSDK RTD] RTD module initialized");

            // Create a mock reqBidsConfigObj that matches Prebid's structure
            const reqBidsConfigObj = {
              ortb2Fragments: {
                global: {},
                bidder: {}
              }
            };

            // Use the RTD module's handleRtd to populate ortb2Fragments
            rtdConfig.handleRtd(reqBidsConfigObj).then(function() {
            console.log("[OptableSDK RTD] handleRtd completed");
            console.log("[OptableSDK RTD] ortb2Fragments.global:", reqBidsConfigObj.ortb2Fragments.global);
            console.log("[OptableSDK RTD] ortb2Fragments.bidder:", reqBidsConfigObj.ortb2Fragments.bidder);

            // Merge the global ortb2 data
            if (reqBidsConfigObj.ortb2Fragments.global) {
              pbjs.mergeConfig({
                ortb2: reqBidsConfigObj.ortb2Fragments.global
              });
            }

            // Merge bidder-specific ortb2 data
            if (reqBidsConfigObj.ortb2Fragments.bidder) {
              for (const [bidderCode, ortb2] of Object.entries(reqBidsConfigObj.ortb2Fragments.bidder)) {
                pbjs.setBidderConfig({
                  bidders: [bidderCode],
                  config: {
                    ortb2: ortb2
                  }
                });
                console.log("[OptableSDK RTD] Set bidder-specific config for:", bidderCode);
              }
            }

            // Configure Prebid
            pbjs.mergeConfig({
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
            console.log("[OptableSDK RTD] pbjs.requestBids(...)");
          }).catch(function(err) {
            console.error("[OptableSDK RTD] Error in handleRtd:", err);
            // Still try to request bids even if RTD fails
            pbjs.mergeConfig({
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
          });
          });
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

        console.log("[OptableSDK RTD] googletag.enableServices()");
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
          <h4>Example: targeting API: Prebid.js (RTD Module)</h4>
          <p>
            Shows how to use the Optable RTD (Real-Time Data) module to automatically inject targeting data
            into Prebid.js with advanced features like bidder-specific routing, merge strategies, and filtering.
          </p>
          <p>
            The RTD module provides several advantages over the basic integration:
          </p>
          <ul>
            <li><strong>Bidder-specific routing:</strong> Routes EIDs to specific bidders (appnexus, ix, rubicon, etc.) instead of just global</li>
            <li><strong>Merge strategies:</strong> Control how EIDs are merged (append, prepend, replace, appendNew)</li>
            <li><strong>Matcher filtering:</strong> Filter EIDs by matcher to only include specific sources</li>
            <li><strong>Advanced configuration:</strong> Customize EID sources, routes, and merge behavior per source</li>
          </ul>
          <p>
            In this example, we use <code>optable.utils.buildRTD()</code> to create an RTD configuration, then call
            <code>handleRtd()</code> to populate Prebid's ortb2Fragments with targeting data from the cache. The RTD
            module automatically handles routing EIDs to the appropriate bidders based on the configured routes.
          </p>
          <p>
            <strong>Check the browser console for detailed logging</strong> to see how the RTD module processes and routes EIDs.
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

        console.log("[OptableSDK RTD] googletag.display() all slots");
      });
    </script>
    <!-- GPT body tag end -->
  </body>
</html>
