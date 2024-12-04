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
      window.optable = window.optable || { cmd: [] };

      optable.cmd.push(function () {
        optable.instance = new optable.SDK({
          host: "${DCN_HOST}",
          initPassport: JSON.parse("${DCN_INIT}"),
          site: "${DCN_SITE}",
          cookies: false,
        });

        optable.instance.tryIdentifyFromParams();
      });
    </script>
    <script async src="${SDK_URI}"></script>
    <!-- Optable web-sdk loader end -->

    <!-- Optable web-sdk inject targeting start -->
    <script>
      optable.cmd.push(function () {
        optable.instance.installGPTEventListeners();
      });

      // Helper to load GAM ads with optional targeting data:
      var loadGAM = function (tdata = {}) {
        // Sets up page-level targeting in GAM360 GPT:
        window.googletag = window.googletag || { cmd: [] };
        googletag.cmd.push(function () {
          for (const [key, values] of Object.entries(tdata)) {
            googletag.pubads().setTargeting(key, values);
            console.log("[OptableSDK] googletag.pubads().setTargeting(" + key + ", [" + values + "])");
          }
          googletag.pubads().refresh();
          console.log("[OptableSDK] googletag.pubads().refresh()");
        });
      };

      // Try to fetch targeting data from sandbox and pass it to GAM:
      optable.cmd.push(function () {
        optable.instance
          .targetingKeyValues()
          .then(loadGAM)
          .catch((err) => {
            console.log("[OptableSDK] targeting() exception: " + err.message);
            loadGAM()
          });
      });
    </script>
    <!-- Optable web-sdk inject targeting end -->

    <!-- GPT header tag start -->
    <script async src="https://securepubads.g.doubleclick.net/tag/js/gpt.js"></script>
    <script>
      window.googletag = window.googletag || { cmd: [] };

      googletag.cmd.push(function () {
        headerAd = googletag
          .defineSlot("/22081946781/web-sdk-demo-gam360/header-ad", [728, 90], "div-gpt-ad-1598295788551-0")
          .addService(googletag.pubads());
        boxAd = googletag
          .defineSlot(
            "/22081946781/web-sdk-demo-gam360/box-ad",
            [
              [250, 250],
              [300, 250],
              [200, 200],
            ],
            "div-gpt-ad-1598295897480-0"
          )
          .addService(googletag.pubads());
        footerAd = googletag
          .defineSlot("/22081946781/web-sdk-demo-gam360/footer-ad", [728, 90], "div-gpt-ad-1598296001655-0")
          .addService(googletag.pubads());

        googletag.pubads().enableSingleRequest();
        googletag.pubads().disableInitialLoad();
        googletag.enableServices();

        console.log("[GPT] googletag.enableServices()");
      });
    </script>
    <!-- GPT header tag end -->
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
          <h4>Example: targeting API: GAM360</h4>
          <p>
            Shows how to load active cohorts for a visitor and pass them to
            <a href="https://admanager.google.com/home/">Google Ad Manager</a> (GAM) via the
            <a href="https://developers.google.com/publisher-tag/guides/get-started">Google Publisher Tag</a> (GPT) for
            ad targeting.
          </p>
          <p>
            In this example, the call to the <code>targetingKeyValues()</code> API happens first and, on success or error, banner
            ads are loaded from Optable's demo GAM account via <code>googletag.pubads().refresh()</code>. In order to
            prevent ads loading until the asynchronous <code>targeting</code> call is done, we start by disabling
            automatic ads loading with <code>googletag.pubads().disableInitialLoad()</code>.
          </p>
          <p>
            To see an alternate way of loading GAM ads with targeting data where <code>disableInitialLoad()</code> is
            not required, check out the
            <a href="/vanilla/targeting/gam360-cached.html">cached targeting &amp; GAM360 activation</a> example
            instead.
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

        console.log("[GPT] googletag.display() all slots");
      });
    </script>
    <!-- GPT body tag end -->
  </body>
</html>
