import type { ResolvedConfig } from "../config";
import { default as buildInfo } from "../build.json";
import { LocalStorage } from "./storage";

function buildRequest(path: string, config: ResolvedConfig, init?: RequestInit): Request {
  const { site, host, cookies } = config;

  const url = new URL(`${site}${path}`, `https://${host}`);
  url.searchParams.set("osdk", `web-${buildInfo.version}`);

  if (cookies) {
    url.searchParams.set("cookies", "yes");
  } else {
    const ls = new LocalStorage(config);
    const pass = ls.getPassport();
    url.searchParams.set("cookies", "no");
    url.searchParams.set("passport", pass ? pass : "");
  }

  const requestInit: RequestInit = { ...init };
  requestInit.credentials = "include";

  const request = new Request(url.toString(), requestInit);

  return request;
}

async function fetch<T>(path: string, config: ResolvedConfig, init?: RequestInit): Promise<T> {
  const response = await globalThis.fetch(buildRequest(path, config, init));

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

export { fetch, buildRequest };
export default fetch;
