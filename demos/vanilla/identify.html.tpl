<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
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
  </head>
  <body>
    <fieldset>
      <legend>Web SDK Demo: Identify API</legend>
      <div>
        <input id="email-checked" type="checkbox" checked />
        <label for="email"> Send Email:</label>
        <input id="email" type="email" size="64" />
      </div>
      <br />
      <div>
        <input id="ppid-checked" type="checkbox" />
        <label for="ppid-checked"> Send PPID:</label>
        <input id="ppid" type="text" size="64" disabled />
      </div>
      <br />
      <button id="identify-button">Identify</button>
    </fieldset>
    <hr />
    <div id="result"></div>
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
          .identifyWithEmail(email, ppid)
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
