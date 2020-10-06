import type { OptableConfig } from "../config";
import { fetch } from "../core/network";

type AuthReadyResponse = {
  origin: string;
  authenticated: boolean;
};

type AuthEmailResponse = {
  origin: string;
  authenticated: boolean;
  email: string;
  redir: string;
};

class Auth {
  authenticated: boolean;

  constructor(private Config: OptableConfig) {
    this.authenticated = false;
  }

  async ready(): Promise<AuthReadyResponse> {
    const res = await fetch<AuthReadyResponse>("/authenticated", this.Config, {
      method: "GET",
    });
    if (res.origin == this.Config.site) {
      this.authenticated = res.authenticated;
    }
    return res;
  }

  emailAuth(formData: FormData): Promise<AuthEmailResponse> {
    return fetch<AuthEmailResponse>("/auth/email", this.Config, {
      method: "POST",
      body: formData,
    });
  }

  googleAuthURL(): string {
    const proto = this.Config.insecure ? "http" : "https";
    return `${proto}://${this.Config.host}/${this.Config.site}/auth/google?cookies=yes`;
  }

  facebookAuthURL(): string {
    const proto = this.Config.insecure ? "http" : "https";
    return `${proto}://${this.Config.host}/${this.Config.site}/auth/facebook?cookies=yes`;
  }
}

export { Auth, AuthReadyResponse, AuthEmailResponse };
export default Auth;
