<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />

    <!-- Optable web-sdk loader start -->
    <script type="text/javascript">
      window.optable = window.optable || { cmd: [] };

      optable.cmd.push(function () {
        optable.instance = new optable.SDK({
          host: "${SANDBOX_HOST}",
          site: "web-sdk-demo",
          insecure: JSON.parse("${SANDBOX_INSECURE}"),
        });
      });
    </script>
    <script async src="${SDK_URI}"></script>
    <!-- Optable web-sdk loader end -->

    <!-- Optable web-sdk inject targeting start -->
    <script>
      // Hook GPT event listeners and send events to sandbox:
      optable.cmd.push(function () {
        optable.instance.installGPTEventListeners();
      });

      // Try to fetch and cache targeting data from sandbox:
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
          const tdata = optable.instance.targetingFromCache();
          for (const [key, values] of Object.entries(tdata)) {
            googletag.pubads().setTargeting(key, values);
            console.log("[OptableSDK] googletag.pubads().setTargeting(" + key + ", [" + values + "])");
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
    <h1>Google Ad Manager 360: Targeting API Integration</h1>

    <h2>web-sdk-demo-gam360/header-ad</h2>
    <!-- GAM360 Ad Unit slot: web-sdk-demo-gam360/header-ad -->
    <div id="div-gpt-ad-1598295788551-0" style="width: 728px; height: 90px;"></div>

    <h2>web-sdk-demo-gam360/box-ad</h2>
    <!-- GAM360 Ad Unit slot: web-sdk-demo-gam360/box-ad -->
    <div id="div-gpt-ad-1598295897480-0"></div>

    <h2>web-sdk-demo-gam360/footer-ad</h2>
    <!-- GAM360 Ad Unit slot: web-sdk-demo-gam360/footer-ad -->
    <div id="div-gpt-ad-1598296001655-0"></div>

    <hr />

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
