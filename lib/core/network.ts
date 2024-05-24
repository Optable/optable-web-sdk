import type { ResolvedConfig } from "../config";
import { default as buildInfo } from "../build.json";
import { LocalStorage } from "./storage";

function buildRequest(path: string, config: ResolvedConfig, init?: RequestInit): Request {
  const { site, host, cookies } = config;

  const url = new URL(`${site}${path}`, `https://${host}`);
  url.searchParams.set("osdk", `web-${buildInfo.version}`);

  if (config.consent.reg) {
    url.searchParams.set("reg", config.consent.reg);
  }

  if (config.consent.gpp) {
    url.searchParams.set("gpp", config.consent.gpp);
  }

  if (config.consent.gppSectionIDs) {
    url.searchParams.set("gpp_sid", config.consent.gppSectionIDs.join(","));
  }

  if (config.consent.tcf) {
    url.searchParams.set("tcf", config.consent.tcf);
  }

  const requestInit: RequestInit = { ...init };

  if (cookies) {
    requestInit.credentials = "include";
    url.searchParams.set("cookies", "yes");
  } else {
    const ls = new LocalStorage(config);
    const pass = ls.getPassport();
    url.searchParams.set("cookies", "no");

    if (pass) {
      const headers = new Headers(requestInit.headers);
      headers.set(config.identityHeaderName, pass);
      requestInit.headers = headers;
    }
  }

  return new Request(url.toString(), requestInit);
}

async function fetch<T>(path: string, config: ResolvedConfig, init?: RequestInit): Promise<T> {
  const response = await globalThis.fetch(buildRequest(path, config, init));

  const contentType = response.headers.get("Content-Type");
  const data = contentType?.startsWith("application/json") ? await response.json() : await response.text();

  if (!response.ok) {
    throw new Error(data.error);
  }

  if (response.headers.has(config.identityHeaderName)) {
    const ls = new LocalStorage(config);
    ls.setPassport(response.headers.get(config.identityHeaderName) || "");
  }

  return data;
}

export { fetch, buildRequest };
export default fetch;
