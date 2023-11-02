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

    <script async src="https://securepubads.g.doubleclick.net/tag/js/gpt.js"></script>
    <script>
      const searchParams = new URLSearchParams(window.location.search);
      const cookiesTransport = searchParams.get("cookies") === "yes"
      const slotID = searchParams.get("slot") ?? "/22081946781/web-sdk-demo-gam360"
      window.googletag = window.googletag || {cmd: []};
      window.optable = window.optable || { cmd: [] };

      optable.cmd.push(() => {
        optable.instance = new optable.SDK({
          host: "${SDK_HOST}",
          initPassport: JSON.parse("${SDK_INIT}"),
          site: "web-sdk-demo",
          insecure: JSON.parse("${SDK_INSECURE}"),
          cookies: cookiesTransport,
        });
      })

      googletag.cmd.push(function() {
        googletag.defineSlot(slotID, [[300, 250]], "div-ad-fledge").addService(googletag.pubads());
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
      <div id='div-ad-fledge' style='width: 300px; height: 250px; border: 1px dotted black;'>
        <script>
          googletag.cmd.push(function() {
            optable.cmd.push(() => {
              optable.instance.installGPTSlotAuctionConfig("div-ad-fledge").then(() => {
                googletag.display("div-ad-fledge");
              });
            })
          });
        </script>
      </div>
    </div>
  </body>
</html>
