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
      /* Contents box. The page documents three classification methods plus the
         GAM key-values, so the sections are linked up front rather than scrolled for. */
      .toc {
        border: 1px solid #e1e1e1;
        border-radius: 4px;
        background: #fafafa;
        padding: 1.5rem 2rem;
      }
      .toc h6 {
        margin-bottom: 1rem;
      }
      .toc ul {
        list-style: none;
        padding-left: 0;
        margin-bottom: 0;
      }
      .toc ul ul {
        margin-top: 0.5rem;
        padding-left: 2rem;
      }
      .toc li {
        margin-bottom: 0.5rem;
      }
      .toc li:last-child {
        margin-bottom: 0;
      }
      .toc-note {
        display: block;
        font-size: 1.3rem;
        line-height: 1.5;
        color: #777;
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
          <nav class="toc" aria-label="Contents">
            <h6>Contents</h6>
            <ul>
              <li>
                <a href="#contextual-segments-api">Example: contextual segments API</a>
                <span class="toc-note">Calling <code>ctxSegments()</code> and the shape of the response it returns.</span>
                <ul>
                  <li>
                    <a href="#classifications-categories"><code>categories</code>: taxonomy category ids scored for the page</a>
                    <span class="toc-note">One entry per category matched, each carrying the taxonomy it came from.</span>
                  </li>
                  <li>
                    <a href="#classifications-keywords"><code>keywords</code>: free-form terms extracted from the page</a>
                    <span class="toc-note">Page terms ranked by prominence, an ordinal rank rather than a score.</span>
                  </li>
                  <li>
                    <a href="#classifications-brand-safety"><code>brandSafety</code>: brand-safety assessment of the page</a>
                    <span class="toc-note">Risk tier per flagged category, assessed from the page's text only.</span>
                  </li>
                </ul>
              </li>
              <li>
                <a href="#result-section">Result</a>
                <span class="toc-note">Call <code>ctxSegments()</code> on a URL and inspect what the DCN returns.</span>
              </li>
              <li>
                <a href="#gam-targeting-key-values">GAM targeting key-values</a>
                <span class="toc-note">Turn the cached response into ad-server key-values with <code>ctxTargetingKeyValues()</code>.</span>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <div class="row">
        <div class="twelve column">
          <h4 id="contextual-segments-api">Example: contextual segments API</h4>
          <p>
            Shows how to call <code>ctxSegments()</code> to classify a page URL and inspect the classifications the DCN
            returns for it: taxonomy categories (e.g. against the
            <a href="https://iabtechlab.com/standards/content-taxonomy/">IAB Content Taxonomy</a>), free-form keywords,
            and/or a brand-safety assessment (against the
            <a href="https://www.brandsafetyinstitute.com/resources/frameworks/brand-safety-floor-suitability">Brand Safety Floor + Suitability Framework</a>), depending on which classifiers the DCN has
            enabled.
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
    brandSafety: { assessed, categories: [{ name, riskLevel }] },
  },
}</code></pre>
          <p>
            The <code>classifications</code> object groups results by classification method, and the DCN includes only
            the methods it has enabled. Three methods exist today:
          </p>
          <h6 id="classifications-categories"><code>categories</code>: taxonomy category ids scored for the page</h6>
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
          <h6 id="classifications-keywords"><code>keywords</code>: free-form terms extracted from the page</h6>
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
          <h6 id="classifications-brand-safety"><code>brandSafety</code>: brand-safety assessment of the page</h6>
          <p>
            The categories and the risk tiers follow the
            <a href="https://www.brandsafetyinstitute.com/resources/frameworks/brand-safety-floor-suitability">Brand Safety Floor + Suitability Framework</a>, which is where the category list and the
            term <code>floor</code> come from.
          </p>
          <p>
            <strong>Note:</strong> only the page's <strong>text</strong> is assessed. Embedded media, such as images,
            video and audio, is not, so a page can come back with nothing flagged and still carry unsafe media. Treat
            the result as a signal about what the page says, not about everything a visitor sees.
          </p>
          <table class="u-full-width">
            <thead>
              <tr><th>Field</th><th>Description</th></tr>
            </thead>
            <tbody>
              <tr>
                <td><code>assessed</code></td>
                <td>
                  Whether an assessment backs <code>categories</code>. It decides what an empty
                  <code>categories</code> means, so read it first: see the table below.
                </td>
              </tr>
              <tr>
                <td><code>categories[].name</code></td>
                <td>Human-readable brand-safety category name.</td>
              </tr>
              <tr>
                <td><code>categories[].riskLevel</code></td>
                <td>
                  Tier the category was flagged at: <code>low</code>, <code>medium</code>, <code>high</code> or
                  <code>floor</code>, in increasing severity, so <code>floor</code> is the framework's brand-safety
                  floor rather than a baseline. <code>not_assessed</code> means the pass did not cover the category,
                  and is not a severity.
                </td>
              </tr>
            </tbody>
          </table>
          <p>
            <strong>Read <code>assessed</code> before <code>categories</code>.</strong> An empty
            <code>categories</code> list means two opposite things depending on it:
          </p>
          <table class="u-full-width">
            <thead>
              <tr><th><code>assessed</code></th><th><code>categories</code></th><th>Meaning</th></tr>
            </thead>
            <tbody>
              <tr><td><code>true</code></td><td>empty</td><td>An assessment ran and flagged nothing.</td></tr>
              <tr>
                <td><code>true</code></td>
                <td>non-empty</td>
                <td>
                  An assessment ran: each entry is a category it flagged, at its <code>riskLevel</code>, or a
                  <code>not_assessed</code> category the pass did not cover. Assessed categories with no finding are
                  omitted.
                </td>
              </tr>
              <tr>
                <td><code>false</code></td>
                <td>always empty</td>
                <td>
                  Nothing is known about this page. The DCN never classified it, the read failed, or this DCN does not
                  run the brand-safety classifier at all.
                </td>
              </tr>
            </tbody>
          </table>
          <p>
            Two helpers read this off the cached response, so you do not have to walk it yourself.
            <code>ctxBrandSafety()</code> returns the group above, and <code>ctxMaxRiskLevel()</code> returns the most
            severe tier flagged, or <code>null</code> when nothing is flagged, which is convenient for a single gate:
          </p>
          <pre><code>if (optable.instance.ctxMaxRiskLevel() === "floor") {
  // Do not monetize this page.
}</code></pre>
          <p>
            <code>null</code> comes back in two different situations: an assessment ran and flagged nothing, and
            nothing is known about the page at all. A gate that must tell those apart reads
            <code>ctxBrandSafety().assessed</code> as well. Note also that a page assessed clean is not a clearance:
            the taxonomy enumerates risks, so the classifier can report that a page matches one but never that it is
            free of them.
          </p>
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
            this page, the URL <code>https://optable.co/</code> should have been classified, so you can try that. A
            URL the DCN holds no classification for comes back with empty <code>categories</code> and
            <code>keywords</code> arrays, and <code>brandSafety.assessed</code> set to <code>false</code>.
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
          <h5 id="result-section">Result</h5>
          <div id="rendered"></div>
          <h6>Raw response</h6>
          <div class="twelve column code-result" id="result">Click the button to call ctxSegments().</div>
        </div>
      </div>

      <div class="row">
        <div class="twelve column">
          <h5 id="gam-targeting-key-values">GAM targeting key-values</h5>
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
            By default the returned map has one key per taxonomy the DCN classified into (keyed by the raw taxonomy
            value), the page's keywords under <code>ctx_kw</code>, and its brand-safety tier under
            <code>ctx_bs_max</code>. For example,
            <code>ctxTargetingKeyValues()</code> might return:
          </p>
          <pre><code>{
  "iab_ct_3_1": ["53", "91", "58", "115", "90", "52"],
  "ctx_kw": ["advertising", "programmatic", "ad tech"],
  "ctx_bs_max": ["no_flags"]
}</code></pre>
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
            Keyword classifications are also emitted, by default under the GAM key <code>ctx_kw</code>. The values are
            the page's keywords ordered by <code>prominence</code> (most prominent first), capped to the top 10, and
            sanitized to GAM's value rules (lowercased, reserved characters stripped, truncated to 40 characters). Pass
            <code>keywordKey</code> to rename the key or <code>maxKeywords</code> to change the cap, or set
            <code>keywordKey</code> to an empty string to opt out of keyword key-values entirely:
          </p>
          <pre><code>// Rename the keyword key and emit only the top 5 keywords:
loadGAM(optable.instance.ctxTargetingKeyValues({ iab_ct_3_1: "ctx_iab" }, { keywordKey: "kw", maxKeywords: 5 }));

// Opt out of keyword key-values:
loadGAM(optable.instance.ctxTargetingKeyValues(undefined, { keywordKey: "" }));</code></pre>
          <p>
            Brand safety is emitted by default under <code>ctx_bs_max</code>, carrying the page's most severe flagged
            tier. It is the same text-only assessment described
            <a href="#classifications-brand-safety">above</a>, so a line item keyed on it is gating on the page's
            words and not on its embedded media. Use <code>brandSafetyKey</code> to rename it, or pass an empty
            <code>brandSafetyKey</code> to opt out, exactly as <code>keywordKey</code> works:
          </p>
          <pre><code>// Rename the brand-safety key:
loadGAM(optable.instance.ctxTargetingKeyValues(undefined, { brandSafetyKey: "bs" }));

// Opt out of the brand-safety key-value:
loadGAM(optable.instance.ctxTargetingKeyValues(undefined, { brandSafetyKey: "" }));</code></pre>
          <p>
            A value is emitted for every state rather than the key being dropped when nothing is
            flagged:
          </p>
          <table class="u-full-width">
            <thead>
              <tr><th>State</th><th>Value</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>A tier was flagged</td>
                <td>
                  The most severe one: <code>low</code>, <code>medium</code>, <code>high</code> or <code>floor</code>
                </td>
              </tr>
              <tr><td>Assessed, nothing flagged</td><td><code>no_flags</code></td></tr>
              <tr><td>Nothing is known about the page</td><td><code>not_assessed</code></td></tr>
            </tbody>
          </table>
          <p>
            The two sentinels exist so a line item can tell them apart. If the key were simply absent when nothing was
            flagged, "we never looked" and "we looked and flagged nothing" would look identical in GAM, and you could
            not exclude unassessed inventory without also excluding clean inventory. <code>no_flags</code> is
            deliberately not named <code>safe</code>: a pass with no finding is not a clearance.
          </p>
          <p>
            <code>not_assessed</code> is spelled the same as the <code>riskLevel</code> a category carries when the
            assessment did not cover it. That is deliberate: one word for one idea, "nothing is known here", at two
            scopes. The scopes cannot be confused, because <code>ctx_bs_max</code> only ever carries a page-level
            answer.
          </p>
          <p>
            One difference from <code>keywordKey</code> is worth knowing before you ship: keywords are dropped when
            the DCN produced none, whereas <code>ctx_bs_max</code> is always present unless you disable it. A DCN that
            does not run the brand-safety classifier therefore adds <code>ctx_bs_max=not_assessed</code> to every ad
            request. If you do not use brand safety at all, pass an empty <code>brandSafetyKey</code> to keep it out.
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
        // A DCN that does not serve brand safety omits the key entirely, which is
        // the same answer as assessed false: nothing is known about this page.
        var brandSafety = (classifications && classifications.brandSafety) || { assessed: false, categories: [] };
        var brandSafetyCategories = Array.isArray(brandSafety.categories) ? brandSafety.categories : [];

        if (categories.length === 0 && keywords.length === 0 && !brandSafety.assessed) {
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

        // Rendered only when an assessment backs it. Without `assessed` an empty
        // list would read as "clean", when it can equally mean the DCN never
        // looked, so the two answers are spelled out separately.
        if (brandSafety.assessed) {
          html += "<h6>Brand safety</h6>";

          if (brandSafetyCategories.length === 0) {
            html += "<p><em>Assessed, and no category was flagged.</em></p>";
          } else {
            var brandSafetyRows = brandSafetyCategories
              .map(function (category) {
                return (
                  "<tr><td>" +
                  escapeHtml(category.name) +
                  "</td><td><code>" +
                  escapeHtml(category.riskLevel) +
                  "</code></td></tr>"
                );
              })
              .join("");

            html +=
              '<table class="u-full-width"><thead><tr><th>Category</th><th>Risk level</th></tr></thead><tbody>' +
              brandSafetyRows +
              "</tbody></table>";
          }

          // ctxSegments() has cached the response by now, so the helper reads it
          // synchronously off the instance.
          var maxRiskLevel = optable.instance.ctxMaxRiskLevel();
          html +=
            "<p>Most severe tier flagged (<code>ctxMaxRiskLevel()</code>): <code>" +
            escapeHtml(maxRiskLevel === null ? "null" : maxRiskLevel) +
            "</code></p>";
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
