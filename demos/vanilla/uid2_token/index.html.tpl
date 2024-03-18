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

    <script src="https://prod.uidapi.com/static/js/uid2-sdk-2.0.0.js" type="text/javascript"></script>

    <style>
      #uid2_state {
        width: 100%;
        overflow: auto;
        table-layout: fixed;
      }
      #uid2_state .label {
        white-space: nowrap;
        padding-right: 20px;
        width: 20%;
      }
      #uid2_state tr {
        margin-top: 10px;
        font-size: 12px;
        table-layout: fixed;
        width: 100%;
        height: 100%;
      }

      .content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        position: center;
      }

      pre {
        white-space: pre-wrap;
        word-wrap: break-word;
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
          <h4>Example: UID2 integration for publishers</h4>
          <p>
            This example illustrates the steps documented in the
            <a href="https://github.com/UnifiedID2/uid2docs/blob/main/api/v2/guides/publisher-client-side.md">UID2 SDK Integration Guide</a>.<br/>
          </p>
          <p>
            The <code>__uid2.init</code> function from the <a href="https://github.com/UnifiedID2/uid2docs/blob/main/api/v2/sdks/client-side-identity.md">UID2 SDK</a>
            is used to load the UID2 identity from a first-party cookie, which contains an advertising token (or uid2 token) that can be used for targeted advertising.<br/>
            If the UID2 identity is missing, then the user needs to authenticates and authorizes its creation.<br/>
          </p>
          <p>
            In the background, the <a href="https://github.com/UnifiedID2/uid2docs/blob/main/api/v2/sdks/client-side-identity.md">UID2 SDK</a>
            will continuously validate if the advertising token needs to be refreshed and refreshes it automatically when needed
            until the refresh token expires or the user opts out, at which point the UID2 identity is cleared and the user needs to
            authorizes the creation of a new UID2 identity.
          </p>
        </div>
      </div>

      <div class="row">
        <div class="column content">
            <table id="uid2_state">
              <tr><th class="label">Ready for Targeted Advertising:</th><td class="value"><pre id="targeted_advertising_ready"></pre></td></tr>
              <tr><th class="label">UID2 Advertising Token:</th><td class="value"><pre id="advertising_token"></pre></td></tr>
              <tr><th class="label">Is UID2 Login Required?</th><td class="value"><pre id="login_required"></pre></td></tr>
              <tr><th class="label">UID2 Identity Updated Counter:</th><td class="value"><pre id="update_counter"></pre></td></tr>
              <tr><th class="label">UID2 Identity Callback State:</th><td class="value"><pre id="identity_state"></pre></td></tr>
            </table>

        </div>
      </div>

      <div class="row">
        <button id="logout-button" class="button-primary">logout</button>
        <button id="login-button" class="button-primary">login Required</button>
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
      let callbackCounter = 0;

      function updateGuiElements(state) {
        document.getElementById("targeted_advertising_ready").innerHTML = __uid2.getAdvertisingToken() ? "yes" : "no";
        document.getElementById("advertising_token").innerHTML = String(__uid2.getAdvertisingToken());
        document.getElementById("login_required").innerHTML = __uid2.isLoginRequired() ? "yes" : "no";
        document.getElementById("update_counter").innerHTML = callbackCounter;
        document.getElementById("identity_state").innerHTML = String(JSON.stringify(state, null, 2));

        if (__uid2.isLoginRequired()) {
          document.getElementById("logout-button").style.display = "none";
          document.getElementById("login-button").style.display = "block";
        } else {
          document.getElementById("logout-button").style.display = "block";
          document.getElementById("login-button").style.display = "none";
        }
      }

      updateGuiElements(undefined);

      function onUid2IdentityUpdated(state) {
        ++callbackCounter;
        updateGuiElements(state);
      }

      __uid2.init({
        callback: onUid2IdentityUpdated,
        baseUrl: "${UID2_BASE_URL}",
      });

      document.getElementById("logout-button").addEventListener("click", () => {
        __uid2.disconnect();
        document.cookie = "__uid_2=;expires=Tue, 1 Jan 1980 23:59:59 GMT;path=/";
        updateGuiElements(undefined);
      });

      document.getElementById("login-button").addEventListener("click", () => {
        location.href = "/vanilla/uid2_token/login.html";
      });
    </script>
  </body>
</html>
