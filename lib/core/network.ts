import type { OptableConfig } from "../config";
import { default as buildInfo } from "../build.json";
import { LocalStorage } from "./storage";

function buildRequest(path: string, config: Required<OptableConfig>, init?: RequestInit): Request {
  const { site, host, insecure, cookies } = config;

  const proto = insecure ? "http" : "https";
  const url = new URL(`${site}${path}`, `${proto}://${host}`);

  if (cookies) {
    url.search = new URLSearchParams({
      cookies: "yes",
      osdk: `web-${buildInfo.version}`,
    }).toString();
  } else {
    const ls = new LocalStorage(config);
    const pass = ls.getPassport();
    url.search = new URLSearchParams({
      cookies: "no",
      passport: pass ? pass : "",
      osdk: `web-${buildInfo.version}`,
    }).toString();
  }

  const requestInit: RequestInit = { ...init };
  requestInit.credentials = "include";

  const request = new Request(url.toString(), requestInit);

  return request;
}

async function fetch<T>(path: string, config: Required<OptableConfig>, init?: RequestInit): Promise<T> {
  const response = await window.fetch(buildRequest(path, config, init));

  const contentType = response.headers.get("Content-Type");
  const data = contentType?.startsWith("application/json") ? await response.json() : await response.text();

  if (!response.ok) {
    throw new Error(data.error);
  }

  if (data.passport) {
    const ls = new LocalStorage(config);
    ls.setPassport(data.passport);

    // We delete the passport attribute from the returned payload. This is because
    // the targeting edge handler was initially made to return targeting data directly
    // in the form of 'key values' on the returned JSON payload -- if we don't delete
    // the `passport` attribute here, it may end up sent as targeting data to ad servers.
    // Not the end of the world, but something we want to avoid due to passport size.
    delete data.passport;
  }

  return data;
}

export { fetch };
export default fetch;
