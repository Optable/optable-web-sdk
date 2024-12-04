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
      // Hook GPT event listeners and send events to DCN:
      optable.cmd.push(function () {
        optable.instance.installGPTEventListeners();
      });

      // Try to fetch and cache targeting data from DCN:
      optable.cmd.push(function () {
        optable.instance.targeting().catch((err) => {
          console.log("[OptableSDK] targeting() exception: " + err.message);
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

        // Setup page-level GAM targeting from any cached targeting data and load ads as usual:
        optable.cmd.push(function () {
          const tdata = optable.instance.targetingKeyValuesFromCache();

          if (tdata) {
            for (const [key, values] of Object.entries(tdata)) {
              googletag.pubads().setTargeting(key, values);
              console.log("[OptableSDK] googletag.pubads().setTargeting(" + key + ", [" + values + "])");
            }
          }

          googletag.pubads().enableSingleRequest();
          googletag.enableServices();

          console.log("[GPT] googletag.enableServices()");
        });
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
          <h4>Example: targeting API: GAM360 (cached data)</h4>
          <p>
            Shows how to load and cache active cohorts in a visitor's browser. Separately, cached cohorts are passed to
            <a href="https://admanager.google.com/home/">Google Ad Manager</a> (GAM) via the
            <a href="https://developers.google.com/publisher-tag/guides/get-started">Google Publisher Tag</a> (GPT) for
            ad targeting.
          </p>
          <p>
            In this example, we use the <code>targetingFromCache()</code> API to retrieve any targeting data from
            browser LocalStorage, in order to pass it to GPT via <code>googletag.pubads().setTargeting()</code>. We also
            call the SDK <code>targeting</code> API which will fetch the latest targeting data from our DCN and
            cache it locally for later use. Since these two events happen asynchronously, it's possible that the
            targeting data passed to GAM is slightly outdated. To ensure ad targeting accuracy, we recommend calling
            <code>targeting</code> to update the local cache on every page load.
          </p>
          <p>
            If you are comfortable with disabling initial load on GAM ads and always loading them explicitly with the
            very latest targeting data, have a look at the
            <a href="/vanilla/targeting/gam360.html">original targeting &amp; GAM360 activation</a> example instead.
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
