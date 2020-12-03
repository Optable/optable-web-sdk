import type { OptableConfig } from "../config";
import { getConfig } from "../config";
import { version } from "../build.json";
import { LocalStorage } from "./storage";

function buildRequest(path: string, config: OptableConfig, init?: RequestInit): Request {
  const { site, host, insecure, cookies } = getConfig(config);

  const proto = insecure ? "http" : "https";
  const url = new URL(`${site}${path}`, `${proto}://${host}`);

  if (cookies) {
    url.search = new URLSearchParams({
      cookies: "yes",
      osdk: `web-${version}`,
    }).toString();
  } else {
    const ls = new LocalStorage(config);
    const pass = ls.getPassport();
    url.search = new URLSearchParams({
      cookies: "no",
      passport: pass ? pass : "",
      osdk: `web-${version}`,
    }).toString();
  }

  const requestInit: RequestInit = { ...init };
  requestInit.credentials = "include";

  const request = new Request(url.toString(), requestInit);

  return request;
}

async function fetch<T>(path: string, config: OptableConfig, init?: RequestInit): Promise<T> {
  const response = await window.fetch(buildRequest(path, config, init));

  const contentType = response.headers.get("Content-Type");
  const data = contentType?.startsWith("application/json") ? await response.json() : await response.text();

  if (!response.ok) {
    throw new Error(data.error);
  }

  if (data.passport) {
    const ls = new LocalStorage(config);
    ls.setPassport(data.passport);
  }

  return data;
}

export { fetch };
export default fetch;
