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
    </script>
    <script async src="${SDK_URI}"></script>
    <script async src="//www.googletagservices.com/tag/js/gpt.js"></script>
    <script async src="prebid.js"></script>
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
          <h4>Open Pair ID</h4>
        </div>
      </div>
      <div id="div-ad" style="width: 300px; height: 250px; border: 1px black dotted">
      </div>
    </div>
    <script>
        window.optable = window.optable || { cmd: [] };
        const cookiesTransport = (new URLSearchParams(window.location.search)).get("cookies") === "yes"

        optable.cmd.push(function () {
          optable.instance = new optable.SDK({
            host: "${DCN_HOST}",
            initPassport: JSON.parse("${DCN_INIT}"),
            site: "${DCN_SITE}",
            node: "${DCN_NODE}",
            legacyHostCache: "${DCN_LEGACY_HOST_CACHE}",
            cookies: cookiesTransport,
          });
        });

        const searchParams = new URLSearchParams(window.location.search);
        const slotID = searchParams.get("slot") ?? "/22081946781/web-sdk-demo-gam360"
        var bannerSizes = [[300, 250]];

        var googletag = googletag || {};
        googletag.cmd = googletag.cmd || [];

        var pbjs = pbjs || {};
        pbjs.que = pbjs.que || [];

        pbjs.que.push(function() {
          pbjs.bidderSettings = {
            appnexus: {
              storageAllowed: true,
            }
          };

          pbjs.mergeConfig({
            debug: true,
            userSync: {
              userIds: [
                {
                  name: 'openPairId',
                  inserter: 'optable.co',
                  matcher: 'tony.test',
                  params: {
                    optable: { storageKey: '_optable_pairId' }
                  },
                },
              ]
            }
          });
          pbjs.addAdUnits(
            {
              code: slotID,
              mediaTypes: { banner: { sizes: bannerSizes } },
              bids: [{
                bidder: 'appnexus',
                params: {
                  placementId: "hello",
                }
              }]
            },
          );

          googletag.cmd.push(function() {
            googletag.pubads().disableInitialLoad();
            googletag.defineSlot(slotID, bannerSizes, "div-ad").addService(googletag.pubads());
            googletag.pubads().enableSingleRequest();
            googletag.enableServices();

            pbjs.requestBids({
              bidsBackHandler: function(bidResponses) {
                pbjs.setTargetingForGPTAsync();
                googletag.pubads().refresh();
              },
            });
          });
        });
    </script>
  </body>
</html>
