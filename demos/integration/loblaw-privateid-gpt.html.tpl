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

    <script async src="${SDK_URI}"></script>
    <script async src="https://securepubads.g.doubleclick.net/tag/js/gpt.js"></script>
    <script>
      window.optable = window.optable || { cmd: [] };
      window.googletag = window.googletag || { cmd: [] };

      optable.cmd.push(function () {
        optable.instance = new optable.SDK({
          host: "${SANDBOX_HOST}",
          site: "web-sdk-demo",
          insecure: JSON.parse("${SANDBOX_INSECURE}"),
          cookies: false,
        });
        optable.instance.targeting()
        optable.instance.installGPTSecureSignals();

        googletag.cmd.push(function() {
          googletag.defineSlot('/22081946781/web-sdk-demo-securesignals/header-ad', [728, 90], 'div-gpt-ad-1682350431454-0').addService(googletag.pubads());
          googletag.defineSlot('/22081946781/web-sdk-demo-securesignals/box-ad', [[250, 250], [300, 250], [200, 200]], 'div-gpt-ad-1682350702718-0').addService(googletag.pubads());
          googletag.defineSlot('/22081946781/web-sdk-demo-securesignals/footer-ad', [728, 90], 'div-gpt-ad-1682350744052-0').addService(googletag.pubads());

          googletag.pubads().enableSingleRequest();
          googletag.enableServices();
        });
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
    </div>

    <div class="container">
      <div class="row">
        <div class="twelve column">
          <h5>web-sdk-demo-securesignals/header-ad</h5>
          <!-- /22081946781/web-sdk-demo-securesignals/header-ad -->
          <div id='div-gpt-ad-1682350431454-0' style='min-width: 728px; min-height: 90px;'>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="twelve column" style="margin-top: 2%;">
          <h5>web-sdk-demo-securesignals/box-ad</h5>
          <!-- /22081946781/web-sdk-demo-securesignals/box-ad -->
          <div id='div-gpt-ad-1682350702718-0' style='min-width: 200px; min-height: 200px;'>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="twelve column" style="margin-top: 2%;">
          <h5>web-sdk-demo-securesignals/footer-ad</h5>
          <!-- /22081946781/web-sdk-demo-securesignals/footer-ad -->
          <div id='div-gpt-ad-1682350744052-0' style='min-width: 728px; min-height: 90px;'>
          </div>
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
      <script>
        optable.cmd.push(function () {
          googletag.cmd.push(function() { googletag.display('div-gpt-ad-1682350431454-0'); });
          googletag.cmd.push(function() { googletag.display('div-gpt-ad-1682350702718-0'); });
          googletag.cmd.push(function() { googletag.display('div-gpt-ad-1682350744052-0'); });
        })
      </script>
    </div>
  </body>
</html>
