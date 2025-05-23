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
          node: "${DCN_NODE}",
          legacyHostCache: "${DCN_LEGACY_HOST_CACHE}",
        });

        optable.instance.tryIdentifyFromParams();
      });
    </script>
    <script async src="${SDK_URI}"></script>
    <!-- Optable web-sdk loader end -->

    <style>
      .code-result {
        padding: 0.2rem 0.5rem;
        margin: 0 0.2rem;
        font-size: 90%;
        background: #f1f1f1;
        border: 1px solid #e1e1e1;
        border-radius: 4px;
        display: block;
        padding: 1rem 1.5rem;
        white-space: pre;
      }
    </style>
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
          <h4>Example: identify API using cookies</h4>
          <p>
            Simple <code>script</code> tag integration showing how to send a hashed Email address and optional publisher
            user ID to your DCN.
          </p>
        </div>
      </div>

      <div class="row">
        <div class="twelve column">
          <fieldset>
            <div>
              <label for="email-checked"><input id="email-checked" type="checkbox" checked /> Email Address:</label>
              <input id="email" type="email" size="64" />
            </div>
            <br />
            <div>
              <label for="ppid-checked"><input id="ppid-checked" type="checkbox" /> Send PPID:</label>
              <input id="ppid" type="text" size="64" disabled />
            </div>
            <br />
            <button id="identify-button" class="button-primary">Identify</button>
          </fieldset>
        </div>
      </div>

      <div class="row">
        <div class="twelve column code-result" id="result"></div>
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

    <script>
      document.getElementById("email-checked").onchange = function () {
        document.getElementById("email").disabled = !this.checked;
      };

      document.getElementById("ppid-checked").onchange = function () {
        document.getElementById("ppid").disabled = !this.checked;
      };

      document.getElementById("identify-button").addEventListener("click", () => {
        const emailCb = document.getElementById("email-checked");
        const ppidCb = document.getElementById("ppid-checked");
        const result = document.getElementById("result");

        var email = null;
        var ppid = null;
        result.innerHTML = "";

        if (emailCb.checked) {
          email = document.getElementById("email").value;
          result.innerHTML += "Email: " + email + " (" + optable.SDK.eid(email) + ")<br />";
        }

        if (ppidCb.checked) {
          ppid = document.getElementById("ppid").value;
          result.innerHTML += "PPID: " + ppid + " (" + optable.SDK.cid(ppid) + ")<br />";
        }

        optable.instance
          .identify(optable.SDK.eid(email), optable.SDK.cid(ppid))
          .then(function () {
            result.innerHTML += "Sent";
          })
          .catch((err) => {
            result.innerHTML += "Error:<br />" + err.message;
          });
      });
    </script>
  </body>
</html>
