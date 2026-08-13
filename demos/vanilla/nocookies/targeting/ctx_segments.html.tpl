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
          cookies: false,
          node: "${DCN_NODE}",
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
        word-break: break-word;
      }
      /* Skeleton sets h5/h6 margin-top to 0; add separation between sections. */
      h5 {
        margin-top: 3rem;
      }
      .score-bar {
        display: inline-block;
        height: 0.8rem;
        background: #33c3f0;
        border-radius: 2px;
        vertical-align: middle;
        margin-right: 0.5rem;
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
          <h4>Example: contextual segments API</h4>
          <p>
            Shows how to call <code>ctxSegments()</code> to classify a page URL and inspect the classifications the DCN
            returns for it: taxonomy categories (e.g. against the
            <a href="https://iabtechlab.com/standards/content-taxonomy/">IAB Content Taxonomy</a>) and/or free-form
            keywords, depending on which classifiers the DCN has enabled.
          </p>
          <pre><code>// Classify the URL of the current page (defaults to window.location.href):
optable.instance.ctxSegments();

// Or classify an explicit URL:
optable.instance.ctxSegments("https://optable.co/");</code></pre>
          <p>The response is a <code>ContextualSegmentsResponse</code>:</p>
          <pre><code>{
  classifications: {
    categories: [{ id, name, score, taxonomy }],
    keywords: [{ keyword, prominence }],
  },
}</code></pre>
          <p>
            The <code>classifications</code> object groups results by classification method, and the DCN includes only
            the methods it has enabled. Two methods exist today:
          </p>
          <h6><code>categories</code>: taxonomy classifications</h6>
          <table class="u-full-width">
            <thead>
              <tr><th>Field</th><th>Description</th></tr>
            </thead>
            <tbody>
              <tr><td><code>id</code></td><td>Category id within its taxonomy (e.g. an IAB category id).</td></tr>
              <tr><td><code>name</code></td><td>Human-readable category name.</td></tr>
              <tr><td><code>score</code></td><td>Relevance score from 0 to 1.</td></tr>
              <tr>
                <td><code>taxonomy</code></td>
                <td>Id of the taxonomy the category belongs to (e.g. <code>iab_ct_3_1</code>).</td>
              </tr>
            </tbody>
          </table>
          <h6><code>keywords</code>: free-form terms extracted from the page</h6>
          <table class="u-full-width">
            <thead>
              <tr><th>Field</th><th>Description</th></tr>
            </thead>
            <tbody>
              <tr><td><code>keyword</code></td><td>The extracted keyword text.</td></tr>
              <tr>
                <td><code>prominence</code></td>
                <td>
                  Per-page ordinal rank (1 = most prominent), not a score, so prominences are not comparable across
                  pages.
                </td>
              </tr>
            </tbody>
          </table>
          <p>
            Alternatively, configure the SDK with <code>initContextual</code> set to a callback. The SDK will
            automatically call <code>ctxSegments()</code> for the URL of the current page on initialization, and
            invoke the callback with the response as soon as it's available — no second call required:
          </p>
          <pre><code>optable.instance = new optable.SDK({
  host: "${DCN_HOST}",
  site: "${DCN_SITE}",
  node: "${DCN_NODE}",
  cookies: false,
  initContextual: function (response) {
    // Use the response, or read it later via optable.instance.ctxTargetingKeyValues().
    console.log("contextual segments:", response);
  },
});</code></pre>
        </div>
      </div>

      <div class="row">
        <div class="twelve column">
          <p>
            <strong>Note:</strong> the URL requested must have been classified by the DCN. For the demo DCN used by
            this page, the URL <code>https://optable.co/</code> should have been classified, so you can try that.
          </p>
        </div>
      </div>

      <div class="row">
        <div class="eight columns">
          <label for="ctx-url">URL to classify</label>
          <input
            class="u-full-width"
            type="text"
            id="ctx-url"
            placeholder="Leave blank to use this page's URL (window.location.href)"
            value="https://optable.co/"
          />
        </div>
        <div class="four columns">
          <label>&nbsp;</label>
          <button id="ctx-button" class="button-primary u-full-width">Get contextual segments</button>
        </div>
      </div>

      <div class="row">
        <div class="twelve column">
          <h5>Result</h5>
          <div id="rendered"></div>
          <h6>Raw response</h6>
          <div class="twelve column code-result" id="result">Click the button to call ctxSegments().</div>
        </div>
      </div>

      <div class="row">
        <div class="twelve column">
          <h5>GAM targeting key-values</h5>
          <p>
            Derived from the cached <code>ctxSegments()</code> response via
            <code>optable.instance.ctxTargetingKeyValues()</code>, this object can be passed straight to Google Ad
            Manager via <code>googletag.pubads().setTargeting(key, values)</code>:
          </p>
          <pre><code>var loadGAM = function (tdata = {}) {
  window.googletag = window.googletag || { cmd: [] };
  googletag.cmd.push(function () {
    for (const [key, values] of Object.entries(tdata)) {
      googletag.pubads().setTargeting(key, values);
    }
    googletag.pubads().refresh();
  });
};</code></pre>
          <p>
            <code>ctxTargetingKeyValues()</code> reads the response cached on the SDK instance, so the instance should
            be initialized with the <code>initContextual: true</code> option. That way the contextual segments are
            fetched during initialization, and the cache is likely to be populated by the time <code>loadGAM()</code>
            runs:
          </p>
          <pre><code>loadGAM(optable.instance.ctxTargetingKeyValues());</code></pre>
          <p>
            If you want <code>loadGAM()</code> to run as soon as the contextual segments arrive — without making a
            second <code>ctxSegments()</code> call — pass a callback to <code>initContextual</code>. The SDK fires the
            contextual request automatically during initialization and invokes the callback with the response,
            populating the cache before <code>ctxTargetingKeyValues()</code> reads from it:
          </p>
          <pre><code>optable.instance = new optable.SDK({
  host: "${DCN_HOST}",
  site: "${DCN_SITE}",
  node: "${DCN_NODE}",
  cookies: false,
  initContextual: function (response) {
    loadGAM(optable.instance.ctxTargetingKeyValues());
  },
});</code></pre>
          <p>
            If you are not using <code>initContextual</code> at all, fetch the segments explicitly and pass the result
            to <code>loadGAM()</code> once <code>ctxSegments()</code> resolves (falling back to an untargeted load on
            error):
          </p>
          <pre><code>optable.cmd.push(function () {
  optable.instance
    .ctxSegments()
    .then(loadGAM)
    .catch((err) => {
      loadGAM();
    });
});</code></pre>
          <p>
            By default each taxonomy is emitted under its own value as the GAM key. Pass a map to
            <code>ctxTargetingKeyValues()</code> to rename keys and allow-list which taxonomies are emitted — only
            taxonomies present in the map are included:
          </p>
          <pre><code>// Emit only the "iab_ct_3_1" taxonomy, under the GAM key "ctx_iab":
loadGAM(optable.instance.ctxTargetingKeyValues({ iab_ct_3_1: "ctx_iab" }));</code></pre>
          <p>
            <strong>Note:</strong> <code>ctxTargetingKeyValues()</code> currently derives key-values from
            <code>classifications.categories</code> only. The <code>classifications.keywords</code> array is not part of
            the map, so keyword classifications are not emitted as GAM key-values.
          </p>
          <div class="twelve column code-result" id="kv-result">—</div>
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
      function escapeHtml(value) {
        return String(value == null ? "" : value)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;");
      }

      // Render the classifications response into a human-readable set of tables.
      // The DCN returns a single `classifications` object that may carry a
      // `categories` array and/or a `keywords` array, depending on which
      // classifiers the node has enabled. Each category carries its own
      // `taxonomy`, so we group categories by taxonomy; keywords are a flat list.
      function renderClassifications(response) {
        var classifications = response && response.classifications;
        var categories =
          classifications && Array.isArray(classifications.categories) ? classifications.categories : [];
        var keywords =
          classifications && Array.isArray(classifications.keywords) ? classifications.keywords : [];

        if (categories.length === 0 && keywords.length === 0) {
          return "<p><em>No contextual classifications were returned for this URL.</em></p>";
        }

        // Group categories by their taxonomy, preserving first-seen order.
        var byTaxonomy = {};
        var order = [];
        categories.forEach(function (category) {
          var taxonomy = category.taxonomy || "(unknown taxonomy)";
          if (!byTaxonomy[taxonomy]) {
            byTaxonomy[taxonomy] = [];
            order.push(taxonomy);
          }
          byTaxonomy[taxonomy].push(category);
        });

        var html = order
          .map(function (taxonomy) {
            var rows = byTaxonomy[taxonomy]
              .map(function (category) {
                var score = typeof category.score === "number" ? category.score : null;
                var pct = score === null ? 0 : Math.max(0, Math.min(1, score)) * 100;
                var bar =
                  '<span class="score-bar" style="width:' +
                  pct.toFixed(0) +
                  'px"></span>' +
                  (score === null ? "n/a" : score.toFixed(2));
                return (
                  "<tr><td><code>" +
                  escapeHtml(category.id) +
                  "</code></td><td>" +
                  escapeHtml(category.name) +
                  "</td><td>" +
                  bar +
                  "</td></tr>"
                );
              })
              .join("");

            return (
              "<h6>Taxonomy: <code>" +
              escapeHtml(taxonomy) +
              "</code></h6>" +
              '<table class="u-full-width"><thead><tr><th>Category ID</th><th>Name</th><th>Score</th></tr></thead><tbody>' +
              rows +
              "</tbody></table>"
            );
          })
          .join("");

        // Keywords carry no taxonomy tree, so they render as a flat list.
        // `prominence` is an ordinal rank within this page's keywords (1 = most
        // prominent), not a score, so it is shown as a plain rank rather than a
        // score bar.
        if (keywords.length > 0) {
          var keywordRows = keywords
            .map(function (keyword) {
              return (
                "<tr><td>" +
                escapeHtml(keyword.keyword) +
                "</td><td>" +
                escapeHtml(keyword.prominence) +
                "</td></tr>"
              );
            })
            .join("");

          html +=
            "<h6>Keywords</h6>" +
            '<table class="u-full-width"><thead><tr><th>Keyword</th><th>Prominence (rank)</th></tr></thead><tbody>' +
            keywordRows +
            "</tbody></table>";
        }

        return html;
      }

      document.getElementById("ctx-button").addEventListener("click", function () {
        var result = document.getElementById("result");
        var rendered = document.getElementById("rendered");
        var kv = document.getElementById("kv-result");
        var url = document.getElementById("ctx-url").value.trim();
        var resolvedUrl = url || window.location.href;

        result.textContent = "Calling ctxSegments(" + JSON.stringify(resolvedUrl) + ") ...";
        rendered.innerHTML = "";
        kv.textContent = "—";

        // Passing undefined makes the SDK default to window.location.href.
        optable.instance
          .ctxSegments(url || undefined)
          .then(function (response) {
            result.textContent = JSON.stringify(response, null, 2);
            rendered.innerHTML = renderClassifications(response);
            // ctxSegments() caches the response on the instance, so the GAM key-values
            // are now available synchronously via ctxTargetingKeyValues().
            kv.textContent = JSON.stringify(optable.instance.ctxTargetingKeyValues(), null, 2);
          })
          .catch(function (err) {
            result.textContent = "Error: " + err.message;
            rendered.innerHTML = "";
            kv.textContent = "—";
          });
      });
    </script>
  </body>
</html>
