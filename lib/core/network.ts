import type { OptableConfig } from "../config";
import { default as buildInfo } from "../build.json";
import { LocalStorage } from "./storage";

function buildRequest(path: string, config: Required<OptableConfig>, init?: RequestInit): Request {
  const { site, host, insecure, cookies } = config;

  const proto = insecure ? "http" : "https";
  const url = new URL(`${site}${path}`, `${proto}://${host}`);

  const requestInit: RequestInit = { ...init };
  const searchParams = new URLSearchParams();
  searchParams.set("osdk", `web-${buildInfo.version}`);

  if (cookies) {
    requestInit.credentials = "include";
    searchParams.set("cookies", "yes");
  } else {
    const ls = new LocalStorage(config);
    const pass = ls.getPassport();
    requestInit.headers = new Headers();
    pass && requestInit.headers.set(config.identityHeaderName, pass);
  }

  return new Request(url.toString(), requestInit);
}

async function fetch<T>(path: string, config: Required<OptableConfig>, init?: RequestInit): Promise<T> {
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

export { fetch };
export default fetch;
