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
          ois: true,
          // The DCN derives this identity from these signals, so
          // without them there is nothing to derive it from.
          forwardSignals: true,
        });
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
      table.ois td,
      table.ois th {
        padding: 8px 16px 8px 0;
        font-size: 0.95rem;
        line-height: 1.5;
        vertical-align: top;
      }
      .note {
        font-size: 0.95rem;
        line-height: 1.65;
        color: #555;
        max-width: 46rem;
      }
      .warn {
        font-size: 0.95rem;
        line-height: 1.65;
        max-width: 46rem;
        background: #fff6e0;
        border: 1px solid #f0dca8;
        border-radius: 4px;
        padding: 0.8rem 1.2rem;
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
          <h4>Example: Optable Identity System (OIS) using cookies</h4>
          <p>
            An OIS-enabled DCN recognizes a browser two ways, and only one of them involves the SDK. This page shows
            both.
          </p>
        </div>
      </div>

      <div class="row">
        <div class="twelve column">
          <h5>1. Cookie identity &mdash; nothing to do</h5>
          <p class="note">
            The browser attaches <code>OPTABLE_OID</code> on its own, so <code>identify</code> and
            <code>profile</code> are already attributed to it. It is <code>HttpOnly</code>, so there is deliberately
            nothing to display here. Block third-party cookies and the DCN falls back to the identity below.
          </p>
        </div>
      </div>

      <div class="row">
        <div class="twelve column">
          <h5>2. Derived identity &mdash; stored and replayed by the SDK</h5>
          <p class="note">
            Derived by the DCN and returned on the <code>X-Optable-OID</code> response header. With
            <code>ois: true</code> the SDK stores it and replays it on that header. It arrives on the first
            <code>identify</code> or <code>profile</code> call &mdash; not during initialization.
          </p>
          <table class="ois" id="state"></table>
          <p class="warn">
            Blank after a call? The DCN only derives this identity when ID derivation is enabled for the node
            <em>and</em> the request comes from a residential IP &mdash; a VPN, datacenter or office IP returns no
            header. It also requires the DCN to expose <code>X-Optable-OID</code> to the browser.
          </p>
        </div>
      </div>

      <div class="row">
        <div class="twelve column">
          <fieldset>
            <button id="identify-button" class="button-primary">Run identify call</button>
            <button id="clear-button">Clear stored ID</button>
            <button id="reload-button">Reload page</button>
          </fieldset>
        </div>
      </div>

      <div class="row">
        <div class="twelve column">
          <h5>Call log</h5>
          <div class="twelve column code-result" id="result"></div>
        </div>
      </div>

      <div class="row">
        <div class="twelve column" style="font-size: 0.8rem; padding: 10px;">
          <center>
            <a href="https://www.optable.co/">Home</a> | <a href="https://www.optable.co/company/contact">Contact</a> |
            <a href="https://terms.optable.co/">Terms</a> |
            <a href="https://www.linkedin.com/company/optableco/">LinkedIn</a> |
            <a href="https://twitter.com/optable_co">Twitter</a>
          </center>
        </div>
      </div>
    </div>

    <script>
      function row(label, value, note) {
        return (
          "<tr><th align='left'>" + label + "</th><td>" + value + "</td><td class='note'>" + (note || "") + "</td></tr>"
        );
      }

      function render() {
        const state = optable.instance.oisState();

        document.getElementById("state").innerHTML =
          row(
            "Derived OIS ID",
            state.id ? "<code>" + state.id + "</code>" : "<em>none yet</em>",
            state.id ? "Replayed on X-Optable-OID on the next call." : "Run a call below."
          ) + row("Storage key", "<code>" + state.storageKey + "</code>");
      }

      // The outgoing header is not exposed by the SDK and the received one is
      // only visible on the Response, so wrap fetch to show what actually went
      // over the wire.
      const nativeFetch = window.fetch;
      window.fetch = function (input) {
        let path = "";
        try {
          const url = new URL(input instanceof Request ? input.url : String(input));
          path = url.pathname;
          const sent = input instanceof Request ? input.headers.get("X-Optable-OID") : null;
          log(path + "  ->  X-Optable-OID: " + (sent || "(none stored yet)"));
        } catch (e) {
          // Never let instrumentation break a request.
        }

        return nativeFetch.apply(this, arguments).then(function (response) {
          try {
            const received = response.headers.get("X-Optable-OID");
            log(path + "  <-  X-Optable-OID: " + (received || "(not returned)"));
          } catch (e) {
            // Ignore.
          }
          return response;
        });
      };

      function log(line) {
        document.getElementById("result").append(line + "\n");
      }

      // Fires whenever the stored ID changes, so the table follows the wire
      // without the handlers below having to re-render.
      window.addEventListener("optable-ois:change", render);

      optable.cmd.push(function () {
        document.getElementById("identify-button").addEventListener("click", () => {
          optable.instance
            .identify(optable.SDK.eid("ois-demo@example.com"))
            .then(() => log("identify ok"))
            .catch((err) => log("identify error: " + err.message));
        });

        document.getElementById("clear-button").addEventListener("click", () => {
          optable.instance.oisClear();
          log("cleared stored ID");
        });

        document.getElementById("reload-button").addEventListener("click", () => window.location.reload());

        render();
      });
    </script>
  </body>
</html>
