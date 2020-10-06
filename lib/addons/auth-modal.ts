import type { OptableConfig } from "../config";
import type { AuthEmailResponse } from "../edge/auth";
import Auth from "../edge/auth";
import MicroModal from "micromodal";
import OptableSDK from "../sdk";

type AuthModalDOMConfig = {
  modalDiv: string;
  emailSentModalDiv: string;
  emailSentModalMsg: string;
  emailErrorModalDiv: string;
  emailErrorModalMsg: string;
  emailFormRedirURL: string;
  emailForm: string;
  googleButton: string;
  facebookButton: string;
};

type MicroModalConfig = {
  openTrigger: string;
  closeTrigger: string;
  openClass: string;
  disableScroll: boolean;
  disableFocus: boolean;
  awaitOpenAnimation: boolean;
  awaitCloseAnimation: boolean;
  debugMode: boolean;
};

class AuthModal {
  auth: Auth;

  constructor(
    private Config: OptableConfig,
    public DOMConfig: AuthModalDOMConfig = {
      modalDiv: "optable-login",
      emailSentModalDiv: "optable-login-email-sent",
      emailSentModalMsg: "data-optable-login-email",
      emailErrorModalDiv: "optable-login-email-error",
      emailErrorModalMsg: "data-optable-login-error",
      emailForm: "optable-login-form",
      emailFormRedirURL: "optable-login-form-rurl",
      googleButton: "optable-login-button-google",
      facebookButton: "optable-login-button-facebook",
    },
    public MicroModalConfig: MicroModalConfig = {
      openTrigger: "data-optable-login-open",
      closeTrigger: "data-optable-login-close",
      openClass: "is-open",
      disableScroll: true,
      disableFocus: false,
      awaitOpenAnimation: true,
      awaitCloseAnimation: true,
      debugMode: false,
    }
  ) {
    const ready = this.ready.bind(this);

    MicroModal.init(this.MicroModalConfig);
    this.auth = new Auth(this.Config);

    if (document.readyState !== "loading") {
      this.auth.ready().then(ready);
    } else {
      window.addEventListener(
        "DOMContentLoaded",
        () => {
          this.auth.ready().then(ready);
        },
        false
      );
    }
  }

  ready() {
    this.installEmailLogin();
    this.installGoogleLogin();
    this.installFacebookLogin();
    this.hijackLinks();

    if (!this.auth.authenticated) {
      this.show(window.location.href);
    }
  }

  show(url?: string) {
    const show = !url || this.installRedirectURL(url);

    if (show) {
      MicroModal.show(this.DOMConfig.modalDiv, this.MicroModalConfig);
    }
  }

  close() {
    MicroModal.close(this.DOMConfig.modalDiv);
  }

  hide() {
    this.close();
  }

  disableForm(form: HTMLFormElement) {
    Array.from(form.elements).forEach((field) => ((field as any).disabled = true));
  }

  enableForm(form: HTMLFormElement) {
    Array.from(form.elements).forEach((field) => ((field as any).disabled = false));
  }

  showMessageModal(modalDivID: string, msgSelector: string, msg: string) {
    const modal = document.getElementById(modalDivID);
    if (modal != null) {
      const sel = modal.querySelector("[" + msgSelector + "]");
      if (sel != null) {
        sel.innerHTML = msg;
      }
      MicroModal.show(modalDivID, this.MicroModalConfig);
    }
  }

  installEmailLogin(): boolean {
    let lform = <HTMLFormElement>document.getElementById(this.DOMConfig.emailForm);
    if (lform == null) {
      return false;
    }

    lform.addEventListener("submit", (e) => {
      e.preventDefault();

      const formData = new FormData(<HTMLFormElement>e.target);
      this.disableForm(lform);

      this.auth
        .emailAuth(formData)
        .then((res: AuthEmailResponse) => {
          if (res.authenticated) {
            window.location.href = res.redir;
            return;
          }

          this.enableForm(lform);
          this.hide();
          this.showMessageModal(this.DOMConfig.emailSentModalDiv, this.DOMConfig.emailSentModalMsg, res.email);
        })
        .catch((err: Error) => {
          this.enableForm(lform);
          this.hide();
          this.showMessageModal(this.DOMConfig.emailErrorModalDiv, this.DOMConfig.emailErrorModalMsg, err.toString());
        });
    });

    return true;
  }

  installGoogleLogin(): boolean {
    let button = <HTMLButtonElement>document.getElementById(this.DOMConfig.googleButton);
    if (button == null) {
      return false;
    }

    button.addEventListener(
      "click",
      () => {
        window.location.href = this.auth.googleAuthURL();
      },
      false
    );
    return true;
  }

  installFacebookLogin(): boolean {
    let button = <HTMLButtonElement>document.getElementById(this.DOMConfig.facebookButton);
    if (button == null) {
      return false;
    }

    button.addEventListener(
      "click",
      () => {
        window.location.href = this.auth.facebookAuthURL();
      },
      false
    );
    return true;
  }

  installRedirectURL(url: string): boolean {
    let redir = <HTMLInputElement>document.getElementById(this.DOMConfig.emailFormRedirURL);

    if (redir != null) {
      redir.value = url;
      return true;
    }

    return false;
  }

  hijackLinks() {
    if (!this.auth.authenticated) {
      const links = <HTMLCollectionOf<HTMLAnchorElement>>document.getElementsByTagName("A");
      for (const link of links) {
        link.addEventListener(
          "click",
          (e: MouseEvent) => {
            e.preventDefault();
            this.show(link.href);
          },
          false
        );
      }
    }
  }
}

export { AuthModal, AuthModalDOMConfig, MicroModalConfig };
export default AuthModal;

declare module "../sdk" {
  export interface OptableSDK {
    authenticator: (DOMConfig?: AuthModalDOMConfig, MicroModalConfig?: MicroModalConfig) => AuthModal;
  }
}

OptableSDK.prototype.authenticator = function (
  DOMConfig?: AuthModalDOMConfig,
  MicroModalConfig?: MicroModalConfig
): AuthModal {
  return new AuthModal(this.sandbox, DOMConfig, MicroModalConfig);
};
