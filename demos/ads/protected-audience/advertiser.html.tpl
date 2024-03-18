<!doctype html>
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
          <h4>Join Ad Interest Groups</h4>
        </div>
        <div class="row">
          <select id="interests-select" multiple style="margin-bottom: 6px; width: 400px; height: 100px;">
            <option value="luxury">Luxury</option>
            <option value="travel">Travel</option>
            <option value="fashion">Fashion</option>
          </select>
        </div>
        <div class="row">
          <button onclick="saveInterests()">Save interests</button>
        </div>
        </div>
        <div class="row">
          <div class="twelve column">
            <button onclick="joinAdInterestGroups()">Join Ad Interest Groups</button>
          </div>
        </div>
      </div>
    </div>

    <script type="text/javascript">
      const cookiesTransport = (new URLSearchParams(window.location.search)).get("cookies") === "yes"
      window.optable = window.optable || { cmd: [] };


      function saveInterests() {
        const interests = Array.from(document.getElementById("interests-select").selectedOptions)
          .map((option) => option.value);

        optable.cmd.push(() => {
          optable.instance.profile({ interests: interests.join(",") })
            .then(() => { alert("Interests successfully saved."); })
            .catch(() => { alert("An error occurred while saving interests."); })
        })
      }

      function joinAdInterestGroups() {
        optable.cmd.push(() => {
          optable.instance.joinAdInterestGroups()
            .then(() => { alert("Interest groups successfully joined."); })
            .catch(() => { alert("An error occurred while joining interest groups."); })
        })
      }

      optable.cmd.push(() => {
        optable.instance = new optable.SDK({
          host: "${DCN_HOST}",
          initPassport: JSON.parse("${DCN_INIT}"),
          site: "${DCN_SITE}",
          insecure: JSON.parse("${DCN_INSECURE}"),
          cookies: cookiesTransport,
        });
      })
    </script>
  </body>
</html>
