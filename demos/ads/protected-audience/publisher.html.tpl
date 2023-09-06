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
        <div class="twelve column">
          <div id="adspot1">
            <script>
              navigator.runAdAuction({
                seller: window.location.origin,
                decisionLogicURL: window.location.origin + "/ads/protected-audiences/decision-logic.js",
                interestGroupBuyers: ["https://${ADS_HOST}"],
                resolveToConfig: true
              })
              .then(function(config) {
                const adFrame = document.createElement("fencedframe")
                adFrame.config = config
                adFrame.style.width = "100%"
                adFrame.style.height = "100%"
                adFrame.style.border = "none"
                adFrame.style.overflow = "hidden"
                document.getElementById("adspot1").replaceChildren(adFrame)
              })
            </script>
          </div>
        </div>
      </div>
    </div>
  </body>
</html>

