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
          host: "${SANDBOX_HOST}",
          site: "web-sdk-demo",
          insecure: JSON.parse("${SANDBOX_INSECURE}"),
        });

        optable.instance.tryIdentifyFromParams();
      });
    </script>
    <script async src="${SDK_URI}" onload="optable.instance.authenticator();"></script>
    <!-- Optable web-sdk loader end -->

    <!-- Optable Authenticator customization markup start -->
    <link rel="stylesheet" href="https://unpkg.com/tachyons@4.10.0/css/tachyons.min.css" />
    <link rel="stylesheet" type="text/css" href="/css/optable-login.css" media="all" />
    <!-- Optable Authenticator customization markup end -->
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
          <h4>Example: authenticator</h4>
          <p>
            Shows how to integrate a lightweight Email login wall. Visitors can authenticate with just their Email
            address, <a href="https://www.facebook.com/">Facebook</a> account, or
            <a href="https://www.google.com/">Google</a> account.
          </p>
          <p>
            When visiting this page for the first time, you will be presented with a login prompt. Once you successfully
            login, the prompt stops appearing for a configurable number of days, after which you will be asked to login
            again. Server-side checks can be additionally implemented in order to limit the content shown to
            unauthenticated visitors.
          </p>
        </div>
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

    <!-- Optable Authenticator markup start -->
    <!-- You can customize this part, also have a look at /css/optable-login.css -->
    <!-- If you change any IDs in this part of the DOM, you may have to modify your call to optable.instance.authenticator() -->
    <div class="optable_login_modal optable-login-slide" id="optable-login" aria-hidden="true">
      <div class="optable_login_modal__overlay" tabindex="-1" data-optable-login-close>
        <div
          class="optable_login_modal__container"
          role="dialog"
          aria-modal="true"
          aria-labelledby="optable-login-title"
        >
          <header class="optable_login_modal__header">
            <h2 class="optable_login_modal__title">
              🔒 Identification Requested
            </h2>
            <button class="optable_login_modal__close" aria-label="Close modal" data-optable-login-close></button>
          </header>
          <main class="optable_login_modal__content">
            <div>
              <p>Please login with your Email address or identity provider account to access free content.</p>
            </div>
            <div>
              <form class="black-80" id="optable-login-form" method="POST">
                <input
                  name="email"
                  required="required"
                  type="email"
                  class="input-reset ba b--black-20 pa2 mb2 db w-100 js-emailInput"
                  placeholder="your.email@example.com"
                />
                <input id="optable-login-form-rurl" type="hidden" name="r" value="" />
                <input type="submit" class="optable_login_modal__btn optable_login_modal__btn-primary" value="Verify" />
              </form>
            </div>
            <div>
              <center><strong>or</strong></center>
            </div>
            <div>
              <button
                id="optable-login-button-google"
                class="optable_login_modal__btn optable_login_modal__btn-login-provider"
              >
                <img src="/images/google.svg" width="25" /> Login with Google
              </button>
              <button
                id="optable-login-button-facebook"
                class="optable_login_modal__btn optable_login_modal__btn-login-provider"
              >
                <img src="/images/facebook.svg" width="25" /> Login with Facebook
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
    <div class="optable_login_modal optable-login-slide" id="optable-login-email-sent" aria-hidden="true">
      <div class="optable_login_modal__overlay" tabindex="-1" data-optable-login-close>
        <div
          class="optable_login_modal__container"
          role="dialog"
          aria-modal="true"
          aria-labelledby="optable-login-title"
        >
          <header class="optable_login_modal__header">
            <h2 class="optable_login_modal__title">
              📧 Check your Email
            </h2>
            <button class="optable_login_modal__close" aria-label="Close modal" data-optable-login-close></button>
          </header>
          <main class="optable_login_modal__content">
            <div>
              <p>
                We sent an Email to <strong><span data-optable-login-email></span></strong>
              </p>
              <br />
              <p>Please click on the link in the Email to login.</p>
            </div>
          </main>
        </div>
      </div>
    </div>

    <div class="optable_login_modal optable-login-slide" id="optable-login-email-error" aria-hidden="true">
      <div class="optable_login_modal__overlay" tabindex="-1" data-optable-login-close>
        <div
          class="optable_login_modal__container"
          role="dialog"
          aria-modal="true"
          aria-labelledby="optable-login-title"
        >
          <header class="optable_login_modal__header">
            <h2 class="optable_login_modal__title">
              ❗Connection Error
            </h2>
            <button class="optable_login_modal__close" aria-label="Close modal" data-optable-login-close></button>
          </header>
          <main class="optable_login_modal__content">
            <div>
              <p>There was a problem processing your login.</p>
              <br />
              <p><span data-optable-login-error></span></p>
              <br />
              <p>Please try again.</p>
            </div>
          </main>
        </div>
      </div>
    </div>
    <!-- Optable Authenticator markup end -->
  </body>
</html>
