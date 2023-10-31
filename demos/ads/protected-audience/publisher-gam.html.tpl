<html>
  <head>
    <meta name="description" content="Optable Web SDK Demos" />
    <meta name="author" content="optable.co" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link href="//fonts.googleapis.com/css?family=Raleway:400,300,600" rel="stylesheet" type="text/css" />
    <link rel="stylesheet" href="/css/normalize.css" />
    <link rel="stylesheet" href="/css/skeleton.css" />
    <link rel="icon" type="image/png" href="/images/favicon.png" />

    <script async src="https://securepubads.g.doubleclick.net/tag/js/gpt.js"></script>
    <script>
      window.googletag = window.googletag || {cmd: []};
      googletag.cmd.push(function() {
        const slot = googletag.defineUnit("/22657645226/multiseller-demo", [300, 250], "div-ad-fledge").addService(googletag.pubads());

        slot.setConfig({
          componentAuction: [{
            configKey: "https://${ADS_HOST}",
            auctionConfig: {
              decisionLogicURL: "https://${ADS_HOST}/${ADS_REGION}/paapi/v1/ssp/decision-logic.js",
              interestGroupBuyers: ["https://${ADS_HOST}"],
              requestedSize: { width: "300px", height: "250px" },
              seller: "https://${ADS_HOST}",
            }
          }],
        })

        googletag.pubads().enableSingleRequest();
        googletag.enableServices();
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
          <h4>GPT</h4>
        </div>
      </div>
      <!-- /22081946781/web-sdk-demo-gam360/box-ad -->
      <div id='div-ad-fledge' style='width: 300px; height: 250px; border: 1px dotted black;'>
        <script>
          googletag.cmd.push(function() {
            googletag.display('div-ad-fledge');
          });
        </script>
      </div>
    </div>
  </body>
</html>
