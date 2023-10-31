<!doctype html>
<html>
  <head>
    <meta name="description" content="Optable Web SDK Demos" />
    <meta name="author" content="optable.co" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link href="//fonts.googleapis.com/css?family=Raleway:400,300,600" rel="stylesheet" type="text/css" />
    <link rel="stylesheet" href="/css/normalize.css" />
    <link rel="stylesheet" href="/css/skeleton.css" />
    <link rel="icon" type="image/png" href="/images/favicon.png" />
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
          <h4>Run Ad Auction</h4>
        </div>
      </div>
      <div class="row">
        <div class="twelve column" style="display: flex; flex-direction: column; gap: 30px">
          <div id="medium" style="text-align: center; width: 300px; height: 250px; border: 1px dotted gray">
            Medium Rectangle goes here
          </div>
          <div id="leaderboard" style="text-align: center; width: 728px; height: 90px; border: 1px dotted gray">
            Leaderboard goes here
          </div>

          <div>
            <button onclick="runAdAuction('medium')">Run Ad Auction for Medium Rectangle</button>
            <button onclick="runAdAuction('leaderboard')">Run Ad Auction for Leaderboard</button>
          </div>

          <script>
            function runAdAuction(spotID) {
              const spot = document.getElementById(spotID);
              const box = spot.getBoundingClientRect();
              const width = Math.round(box.width) - 2;
              const height = Math.round(box.height) - 2;

              navigator.runAdAuction({
                seller: "https://${ADS_HOST}",
                decisionLogicURL: "https://${ADS_HOST}/${ADS_REGION}/paapi/v1/ssp/decision-logic.js",
                requestedSize: { width: width + "px", height: height + "px" },
                interestGroupBuyers: ["https://${ADS_HOST}"],
                resolveToConfig: true
              })
              .then(function(config) {
                if (config) {
                  const adFrame = document.createElement("fencedframe")
                  adFrame.config = config
                  adFrame.style.border = "none"
                  adFrame.style.overflow = "hidden"
                  spot.replaceChildren(adFrame)
                } else {
                  alert("No ad returned or auction error.")
                }
              })
            }
          </script>
        </div>
      </div>
    </div>
  </body>
</html>

