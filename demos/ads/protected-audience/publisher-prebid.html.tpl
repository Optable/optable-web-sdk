<html>
  <head>
    <meta name="description" content="Optable Web SDK Demos" />
    <meta name="author" content="optable.co" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link href="//fonts.googleapis.com/css?family=Raleway:400,300,600" rel="stylesheet" type="text/css" />
    <link rel="stylesheet" href="/css/normalize.css" />
    <link rel="stylesheet" href="/css/skeleton.css" />
    <link rel="icon" type="image/png" href="/images/favicon.png" />

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
          <h4>Prebid.js</h4>
        </div>
      </div>
      <div id="div-ad-fledge" style="width: 300px; height: 250px; border: 1px black dotted">
      </div>
    </div>

    <script>
        const searchParams = new URLSearchParams(window.location.search);
        const slotID = searchParams.get("slot") ?? "/22081946781/web-sdk-demo-gam360"
        var bannerSizes = [[300, 250]];

        var googletag = googletag || {};
        googletag.cmd = googletag.cmd || [];

        var pbjs = pbjs || {};
        pbjs.que = pbjs.que || [];

        pbjs.que.push(function() {
          pbjs.setConfig({
            optableOrtbUrl: "https://${ADS_HOST}/${ADS_REGION}/ortb2/v1/ssp/bid",
            fledgeForGpt: {
              enabled: true,
              bidders: ["optable"],
              defaultForSlots: 1
            }
          });

          pbjs.setBidderConfig({
            bidders: ["optable"],
            config: {
              fledgeEnabled: true,
              defaultForSlots: 1
            }
          });

          pbjs.addAdUnits(
            {
              code: slotID,
              mediaTypes: { banner: { sizes: bannerSizes } },
              bids: [{ bidder: "optable", params: { site: "${DCN_ID}/${DCN_SITE}" } }]
            },
          );

          googletag.cmd.push(function() {
            googletag.pubads().disableInitialLoad();
            googletag.defineSlot(slotID, bannerSizes, "div-ad-fledge").addService(googletag.pubads());
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
