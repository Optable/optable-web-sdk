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

    <!-- Optable web-sdk loader start -->
    <script type="text/javascript">
      window.optable = window.optable || { cmd: [] };

      optable.cmd.push(function () {
        optable.instance = new optable.SDK({
          host: "${SANDBOX_HOST}",
          site: "web-sdk-demo",
          insecure: JSON.parse("${SANDBOX_INSECURE}"),
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
            Simple login page for the user to complete the UID2 login process.<br/>
            <strong>
                IMPORTANT: A real-life application must also display a form for the user to express their consent to targeted advertising.
            </strong>
          </p>
          <p>
            In this example, we use the <code>uid2Token</code> API to generate UID2 identity information containing an advertising token (or uid2 token),
            which can be used for targeted advertising.<br/>
            The <code>__uid2.init</code> function from the <a href="https://github.com/UnifiedID2/uid2docs/blob/main/api/v2/sdks/client-side-identity.md">UID2 SDK</a>
            is used to store the UID2 identity in a first-party cookie for use on subsequent page loads.<br/>
            In the background, the <a href="https://github.com/UnifiedID2/uid2docs/blob/main/api/v2/sdks/client-side-identity.md">UID2 SDK</a> 
            will continuously validate if the advertising token needs to be refreshed, if the refresh token expired or if the user opted out.
          </p>
        </div>
        <p>
            Note: The <code>optout@email.com</code> email can be used to test user opt out.
            Using this email always generates an identity response with a refresh_token that results in a <code>optout</code> response when refreshed.
        </p>
      </div>

      <div class="row">
        <div class="twelve column" id="email-group">
          <fieldset>
            <div>
              <label>Email Address:</label>
              <input id="email" type="email" size="64" />
            </div>
            <button id="login-button" class="button-primary">Login</button>
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
      document.getElementById("login-button").addEventListener("click", () => {
        const result = document.getElementById("result");
        var email = document.getElementById("email").value;

        result.innerHTML = "";

        optable.instance
          .uid2Token(optable.SDK.eid(email))
          .then(function (identity) {
            result.innerHTML += "UID2 identity:<br/>";
            result.innerHTML += JSON.stringify(identity, null, 2);
            result.innerHTML += "<br/><br/>";

            function onUid2IdentityUpdated(state) {
                if (__uid2.isLoginRequired()) {
                    document.getElementById("email-group").style.display = "block"
                    result.innerHTML = "";
                } else {
                    document.getElementById("email-group").style.display = "none"
                    result.innerHTML += "Login completed: <a href=\"/vanilla/uid2_token/\">Proceed to the main page</a>"
                    result.innerHTML += "<br/><br/>";
                }
            }

            __uid2.init({
                callback: onUid2IdentityUpdated,
                baseUrl: "${UID2_BASE_URL}",
                identity: identity
            });
          })
          .catch((err) => {
            result.innerHTML += "Error:<br/>" + err.message;
          });
      });
    </script>
  </body>
</html>
