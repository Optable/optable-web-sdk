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
    <script async src="prebid.js"></script>

    <script type="text/javascript">
      window.optable = window.optable || { cmd: [] };
      window.pbjs = window.pbjs || { que: [] };

      optable.cmd.push(function () {
        optable.instance = new optable.SDK({
          host: "${SANDBOX_HOST}",
          site: "web-sdk-demo",
          insecure: JSON.parse("${SANDBOX_INSECURE}"),
          cookies: false,
        });
      });

      pbjs.que.push(function () {
        pbjs.addAdUnits([
          {
            code: "ad",
            mediaTypes: { banner: { sizes: [[300, 250]] } },
            bids: [{ bidder: "mabidder", params: { ppid: "ppid" }}],
          },
        ]);
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
          <h4>integration: Loblaw's Private ID using prebid.js</h4>
        </div>
      </div>
      <div class="row">
        <div class="twelve column">
          <h4>Publisher Setup</h4>
          <p>
            As a publisher, integrating your DCN with Loblaw's Private ID is a simple way to activate your inventory
            with higher accuracy than traditional cohort-based targeting while preserving your users' privacy.
            This guide shows how to setup your Optable DCN in order to send Private ID data to Loblaw.
          </p>

          <h5>Step 1</h5>
          <p>
            Contact your Optable account manager to request access to the Loblaw integration on your node.
            <br/>
            Once setup, the Loblaw partner will appear in the connected partners list.
          </p>

          <h5>Step 2</h5>
          <p>
            Create a Web SDK source in your node. <br/>
            Unlike normal cohort based targeting that you need to activate explicitly, Loblaw Private ID is enabled by default on all matched users with your Loblaw partner.
          </p>

          <h5>Step 3</h5>
          <p>
            In order to communicate Private ID's to Loblaw from your Web SDK source, depending on how you generated your prebid.js distribution, you may need to update it to include <code>mabidder</code> bidder. See <a target="_blank" rel="noopener" href="https://docs.prebid.org/download.html">https://docs.prebid.org/download.html</a>.<br/>

            Make sure to include the "mabidder" bidder your <code>addAdUnits()</code> prebid.js's SDK call.

            Similarly to audience targeting, Private IDs are automatically passed down in edge targeting responses for all SDK sources.<br/> A convenience function <code>prebidORTB2</code> (or it's cached variant <code>prebidORTB2FromCache</code>) can be used on the web SDK to build the <code>ortb2</code> object expected by prebid.js <code>setConfig</code> or <code>mergeConfig</code> configuration functions.

          </p>
          <p>
          Example of a full integration snippet which configures prebid.js to send bid requests including matched identifiers to Loblaw's prebid.js ad server:

            <pre><code style="padding: 20px">// Setup both Optable and prebid.js SDKs.
window.optable = window.optable || { cmd: [] };
window.pbjs = window.pbjs || { que: [] };

optable.cmd.push(function () {
  optable.instance = new optable.SDK({
    host: "{MY_NODE_HOST}",
    site: "{MY_NODE_ORIGIN}",
  });
});

// Configure some ad units.
// Note that while it's not relevant for Private ID integration,
// Loblaw's prebid ad server currently requires passing a ppid.
pbjs.que.push(function () {
  pbjs.addAdUnits([
    {
      code: "ad",
      mediaTypes: { banner: { sizes: [[300, 250]] } },
      bids: [{ bidder: "mabidder", params: { ppid: "{MY_PPID}" }}],
    },
  ]);
});

// Obtain the prebid ortb2 object through targeting API using Optable SDK and then send a bid request to LobLaw
// containing the Private IDs as openRTB eid's.
optable.cmd.push(function () {
  optable.instance
    .identify(optable.SDK.eid(email))
    .then(optable.instance.prebidORTB2.bind(optable.instance))
    .then((ortb2) => {
      pbjs.que.push(function () {
        pbjs.setConfig({ ortb2: ortb2 });
        pbjs.requestBids({ bidsBackHandler: console.log, });
      });
    });
})</code></pre>
          </p>
          <h4>Try it!</h4>
          <p>
            This demo page is setup so that the following random emails are generating Private ID requests.
            <pre><code style="padding: 20px">e:da1fead79be2dd0fc0450bc6e8157cb42f5289261b3d829108395dd8454056d6
e:a14918ffa4c3e90b81153fa78eae2175161ac6741bf0ce91e529a22c18d309c3
e:0336cbdb1a44e26276b48fee0c70d25bf0f6adeca86642a4d0b084190de7027a
e:76ee2b2bd51c3fad442f5355f26e0224c7c5a96cee8272aa87830da347db1313
e:31d6da0fbac2e5039646b8817ea50a3dae26537de7cb833b6e759eba779fcc5d
e:58e9f67ed2711bf874bfc19615d2d0cb9aca9200515513495f0d70475e9dc590
e:0bd4d8d8de86dd6bca2e096fbdd111c1ad87046b1df3240eb0eb8bf41c6d98a1
e:06e91979bf00a1a3b69d93f36d9488336689e769632346b853ca9f8a00f423b7
e:26283d3669f4edf35f17b98f5031277842ffb7547af81b7546d279b0934913ba
e:5d6d6ed5354f68d7523b7b39330145346209d20b06f5ed32373583823bac8d1a</code></pre>
          </p>

          <p>
            Identifier:<br/><input type="text" id="identifier"/><br/>
            Prebid ORTB2:<br/><pre><code id="prebid-ortb2"></code></pre><br/>
            Prebid Response:<br/><pre><code id="prebid-response"></code></pre><br/>
            <button id="request-bids">Request bids</button>
            </p>
            <script>
              optable.cmd.push(function () {
                document.getElementById("request-bids").addEventListener("click", function() {
                  const identifier = document.getElementById("identifier").value;
                  optable.instance.identify(identifier.trim()).then(function() {
                    optable.instance.prebidORTB2().then(function(ortb2) {
                      pbjs.setConfig({ ortb2: ortb2 });
                      document.getElementById("prebid-ortb2").innerText = JSON.stringify(ortb2, null, 2);
                      pbjs.requestBids({ bidsBackHandler: function(bids, _, auctionID) {
                        document.getElementById("prebid-response").innerText = JSON.stringify({ bids, auctionID }, null, 2);
                      }});
                    });
                  });
                });
              })
            </script>
          </p>
        </div>
      </div>
    </div>
  </body>
</html>
