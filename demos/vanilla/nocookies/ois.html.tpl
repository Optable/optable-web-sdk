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
          cookies: false,
          ois: true,
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
        padding: 4px 12px 4px 0;
        font-size: 0.85rem;
      }
      .badge {
        display: inline-block;
        padding: 1px 8px;
        border-radius: 10px;
        font-size: 0.75rem;
        background: #e1e1e1;
      }
      .badge.cookie {
        background: #d3ecd3;
      }
      .badge.localstorage {
        background: #ffe7c2;
      }
      .badge.unknown {
        background: #e1e1e1;
      }
      .note {
        font-size: 0.8rem;
        color: #666;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="row">
        <div class="twelve column" style="margin-top: 5%;">
          <a href="/index-nocookies.html"><img src="/images/logo.png" width="200" /></a>
          <hr />
        </div>
      </div>

      <div class="row">
        <div class="twelve column">
          <h4>Example: Optable Identity System (OIS) using LocalStorage</h4>
          <p>
            The DCN assigns this browser an OIS ID and returns it as <code>ois_id</code>, alongside
            <code>oid_source</code> naming the transport it was resolved from. With <code>ois: true</code> the SDK stores
            that ID and replays it on the <code>X-Optable-OID</code> header, so this browser keeps the same identity
            where the <code>OPTABLE_OID</code> cookie is blocked.
          </p>
          <p class="note">
            The <code>OPTABLE_OID</code> cookie is <code>HttpOnly</code> and scoped to <code>Domain=optable.co</code>, so
            JavaScript can never read it. Everything below comes from the response body. The DCN reads the cookie
            <em>before</em> the header, so the header is a fallback and never an override. This page is served from a
            different site than the DCN, so the cookie is a third-party cookie here &mdash; exactly the situation a
            publisher is in.
          </p>
        </div>
      </div>

      <div class="row">
        <div class="twelve column">
          <fieldset>
            <button id="targeting-button" class="button-primary">Run targeting call</button>
            <button id="identify-button">Run identify call</button>
            <button id="clear-button">Clear stored OIS ID</button>
            <button id="reload-button">Reload page</button>
          </fieldset>
        </div>
      </div>

      <div class="row">
        <div class="twelve column">
          <h5>OIS state</h5>
          <table class="ois" id="state"></table>
        </div>
      </div>

      <div class="row">
        <div class="twelve column">
          <h5>Forwarded device signals (<code>sig</code>)</h5>
          <p class="note">
            Decoded from the <code>sig</code> param the SDK forwards when <code>forwardSignals: true</code>. The DCN uses
            these to derive a fingerprint-based OIS ID for browsers with no usable storage at all.
          </p>
          <table class="ois" id="signals"></table>
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
      // What each transport value actually tells you. A minted ID means the DCN
      // saw neither a cookie nor a header, which happens both on a first visit
      // and when the cookie is blocked, so it cannot claim either.
      const TRANSPORT_NOTE = {
        cookie: "The OPTABLE_OID cookie reached the DCN on the last call.",
        localstorage: "The cookie did not arrive; the DCN used the ID replayed from localStorage.",
        unknown: "No ID stored yet, or the DCN minted one (first visit, or the cookie was dropped).",
      };

      const SOURCE_NOTE = {
        cookie: "Resolved from the OPTABLE_OID cookie. Stored, so it survives the cookie being blocked later.",
        header: "Resolved from the X-Optable-OID header the SDK sent. This is the stored ID being replayed.",
        minted: "No ID arrived, so the DCN minted a fresh one. Only stored if nothing was stored yet.",
      };

      function row(label, value, note) {
        return (
          "<tr><th align='left'>" +
          label +
          "</th><td>" +
          value +
          "</td><td class='note'>" +
          (note || "") +
          "</td></tr>"
        );
      }

      function render() {
        const state = optable.instance.oisState();
        const transport = state.transport || "unknown";

        document.getElementById("state").innerHTML =
          row("OIS ID", state.id ? "<code>" + state.id + "</code>" : "<em>none stored yet</em>") +
          row(
            "Transport",
            "<span class='badge " + transport + "'>" + transport + "</span>",
            TRANSPORT_NOTE[transport]
          ) +
          row(
            "Reported source",
            state.source ? "<code>" + state.source + "</code>" : "<em>n/a</em>",
            state.source ? SOURCE_NOTE[state.source] : "No call has returned an OIS ID yet."
          ) +
          row("Storage key", "<code>" + state.storageKey + "</code>") +
          row(
            "Storage writable",
            state.storageWritable === null ? "<em>not attempted yet</em>" : String(state.storageWritable)
          ) +
          row("Last updated", state.updatedAt ? new Date(state.updatedAt).toISOString() : "<em>n/a</em>");

        renderSignals();
      }

      function renderSignals() {
        const target = document.getElementById("signals");
        // Show the blob the SDK actually forwarded rather than re-reading the
        // device APIs independently, so this matches what the DCN received.
        const sig = lastSig;
        if (!sig) {
          target.innerHTML = row("sig", "<em>no call made yet</em>");
          return;
        }

        let decoded = "";
        try {
          decoded = atob(sig.replace(/-/g, "+").replace(/_/g, "/"));
        } catch (e) {
          decoded = "";
        }

        let html = row("Encoded", "<code style='word-break:break-all'>" + sig + "</code>");
        if (decoded) {
          new URLSearchParams(decoded).forEach(function (value, key) {
            html += row(key, "<code>" + value + "</code>");
          });
        }
        target.innerHTML = html;
      }

      // The SDK does not expose the sig blob, so capture it off the outgoing
      // request URL instead of duplicating the collection logic.
      let lastSig = "";
      const nativeFetch = window.fetch;
      window.fetch = function (input) {
        try {
          const url = new URL(input instanceof Request ? input.url : String(input));
          const sig = url.searchParams.get("sig");
          if (sig) {
            lastSig = sig;
          }
          const oid = input instanceof Request ? input.headers.get("X-Optable-OID") : null;
          log(url.pathname + (oid ? "  X-Optable-OID: " + oid : "  (no OIS header)"));
        } catch (e) {
          // Never let instrumentation break a request.
        }
        return nativeFetch.apply(this, arguments);
      };

      function log(line) {
        const result = document.getElementById("result");
        result.innerHTML += line + "\n";
      }

      window.addEventListener("optable-ois:change", render);

      optable.cmd.push(function () {
        document.getElementById("targeting-button").addEventListener("click", () => {
          optable.instance
            .targeting()
            .then(() => {
              log("targeting ok");
              render();
            })
            .catch((err) => log("targeting error: " + err.message));
        });

        document.getElementById("identify-button").addEventListener("click", () => {
          optable.instance
            .identify(optable.SDK.eid("ois-demo@example.com"))
            .then(() => {
              log("identify ok");
              render();
            })
            .catch((err) => log("identify error: " + err.message));
        });

        document.getElementById("clear-button").addEventListener("click", () => {
          optable.instance.oisClear();
          log("cleared stored OIS ID");
          render();
        });

        document.getElementById("reload-button").addEventListener("click", () => window.location.reload());

        // The SDK fetches /config during init, which is the call that first
        // reports an OIS ID, so wait for it before the initial render.
        optable.instance.site().finally(render);
      });
    </script>
  </body>
</html>
