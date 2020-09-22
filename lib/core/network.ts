import type { SandboxConfig } from "../config";
import { getConfig } from "../config";

function buildRequest(path: string, config: SandboxConfig, init?: RequestInit): Request {
  const { site, host, insecure } = getConfig(config);

  const proto = insecure ? "http" : "https";
  const url = new URL(`${site}${path}`, `${proto}://${host}`);
  url.search = new URLSearchParams({
    cookies: "yes",
    osdk: "",
  }).toString();

  const requestInit: RequestInit = { ...init };
  requestInit.credentials = "include";

  const request = new Request(url.toString(), requestInit);

  return request;
}

async function fetch<T>(path: string, config: SandboxConfig, init?: RequestInit): Promise<T> {
  const response = await window.fetch(buildRequest(path, config, init));

  const contentType = response.headers.get("Content-Type");
  const data = contentType?.startsWith("application/json") ? await response.json() : await response.text();

  if (!response.ok) {
    throw new Error(data.error);
  }

  return data;
}

export { fetch };
export default fetch;
