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
          <h4>Example: profile API using cookies</h4>
          <p>Shows how to set visitor traits (e.g., <code>age=45</code>) and sync them to your DCN.</p>
          <pre>
          <code>
            // Set some traits on the current visitor:
            optable.instance.profile({ gender: "F", age: 38, favColor: "blue" });

            // Set some new traits and update some existing on the current visitor:
            optable.instance.profile({ favColor: "green", firstName: "Mary", lastName: "Smith" });
          </code>
          </pre>
        </div>
      </div>

      <div class="row">
        <div class="twelve column">
          <button id="profile-button1">Traits 1</button>
          <button id="profile-button2">Traits 2</button>
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
      document.getElementById("profile-button1").addEventListener("click", () => {
        const result = document.getElementById("result");
        optable.instance
          .profile({ gender: "F", age: 38, favColor: "blue" })
          .then(function () {
            result.innerHTML += '<br /><b>Upsert traits:</b> { gender: "F", age: 38, favColor: "blue" }';
          })
          .catch((err) => {
            result.innerHTML += "<br /><b>Error profile-button1:</b> " + err.message;
          });
      });

      document.getElementById("profile-button2").addEventListener("click", () => {
        optable.instance
          .profile({ favColor: "green", firstName: "Mary", lastName: "Smith" })
          .then(function () {
            result.innerHTML +=
              '<br /><b>Upsert traits:</b> { favColor: "green", firstName: "Mary", lastName: "Smith" }';
          })
          .catch((err) => {
            result.innerHTML += "<br /><b>Error profile-button2:</b> " + err.message;
          });
      });
    </script>
  </body>
</html>
