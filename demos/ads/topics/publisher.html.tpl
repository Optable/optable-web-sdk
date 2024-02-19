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

    <script type="text/javascript">
      const cookiesTransport = (new URLSearchParams(window.location.search)).get("cookies") === "yes"
      window.optable = window.optable || { cmd: [] };

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
          <h4>Topics</h4>
        </div>

        <div id="topics"></div>
        <div>
          <button onclick="getTopics()">Get Topics</button>
        </div>
        <div>
          <button onclick="ingestTopics()">Ingest Topics</button>
        </div>
      </div>
    </div>
    <script type="text/javascript">
      function ingestTopics() {
        optable.instance.ingestTopics();
      }

      function getTopics() {
        const topicsDiv = document.getElementById("topics");
        topicsDiv.innerHTML = "Loading...";

        optable.instance.getTopics().then((topics) => {
          topicsDiv.innerHTML = `Found ${topics.length} topic${topics.length > 1 ? "s" : ""}.`;
          topics.forEach((topic) => {
            const topicDiv = document.createElement("div");
            topicDiv.innerHTML = `<strong>Version ${topic.taxonomyVersion}</strong> - ${topic.topic}`;
            topicsDiv.appendChild(topicDiv);
          });
        });
      }
    </script>
  </body>
</html>

