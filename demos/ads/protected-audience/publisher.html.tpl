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

    <script async src="${SDK_URI}"></script>

    <script type="text/javascript">
      const cookiesTransport = (new URLSearchParams(window.location.search)).get("cookies") === "yes"
      window.optable = window.optable || { cmd: [] };

      function runAdAuction(spotID) {
        optable.cmd.push(() => {
          optable.instance.runAdAuction(spotID)
        })
      }

      optable.cmd.push(() => {
        optable.instance = new optable.SDK({
          host: "${SDK_HOST}",
          initPassport: JSON.parse("${SDK_INIT}"),
          site: "web-sdk-demo",
          insecure: JSON.parse("${SDK_INSECURE}"),
          cookies: cookiesTransport,
        });
      })
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
        </div>
      </div>
    </div>
  </body>
</html>

