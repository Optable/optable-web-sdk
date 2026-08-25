import type { ResolvedConfig } from "../config";
import { default as buildInfo } from "../build.json";
import { LocalStorage } from "./storage";
import { deviceSignals } from "./signals";
import { oisHeaderName, oisRequestID, readOISHeader } from "./ois";

function buildRequest(path: string, config: ResolvedConfig, init?: RequestInit): Request {
  const { host, cookies, insecure } = config;

  const url = new URL(path, `${insecure ? "http" : "https"}://${host}`);
  url.searchParams.set("osdk", `web-${buildInfo.version}`);
  url.searchParams.set("sid", config.sessionID);

  if (config.skipEnrichment) {
    url.searchParams.set("skip_enrichment", `${config.skipEnrichment}`);
  }

  if (config.node) {
    url.searchParams.set("t", config.node);
  }

  if (config.site) {
    url.searchParams.set("o", config.site);
  }

  if (typeof config.consent.gpp !== "undefined") {
    url.searchParams.set("gpp", config.consent.gpp);
  }

  if (typeof config.consent.gppSectionIDs !== "undefined") {
    url.searchParams.set("gpp_sid", config.consent.gppSectionIDs.join(","));
  }

  if (typeof config.consent.gdpr !== "undefined") {
    url.searchParams.set("gdpr_consent", config.consent.gdpr);
  }

  if (typeof config.consent.gdprApplies !== "undefined") {
    url.searchParams.set("gdpr", Number(config.consent.gdprApplies).toString());
  }

  if (config.readOnly) {
    url.searchParams.set("ro", "true");
  }

  if (config.timeout) {
    url.searchParams.set("timeout", config.timeout);
  }

  if (cookies) {
    url.searchParams.set("cookies", "yes");
  } else {
    const ls = new LocalStorage(config);
    const pass = ls.getPassport();
    url.searchParams.set("cookies", "no");
    url.searchParams.set("passport", pass ? pass : "");
  }

  if (config.forwardSignals && config.consent.deviceAccess) {
    const sig = deviceSignals();
    if (sig) {
      url.searchParams.set("sig", sig);
    }
  }

  const requestInit: RequestInit = { ...init };
  requestInit.credentials = config.consent.deviceAccess ? "include" : "omit";
  const headers = new Headers(requestInit.headers);
  requestInit.headers = headers;

  if (config.mockedIP) {
    headers.set("X-Forwarded-For", config.mockedIP);
  }

  // Replay the stored derived OIS id so the node recognizes this browser
  // instead of deriving a new id for it. The cookie identity is not involved:
  // the browser attaches OPTABLE_OID on its own and its value is not readable
  // from here.
  if (config.ois && config.consent.deviceAccess) {
    const oisID = oisRequestID(config, url.pathname);
    if (oisID) {
      headers.set(oisHeaderName, oisID);
    }
  }

  const request = new Request(url.toString(), requestInit);

  return request;
}

async function fetch<T>(path: string, config: ResolvedConfig, init?: RequestInit): Promise<T> {
  const request = buildRequest(path, config, init);
  const response = await globalThis.fetch(request);

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

  // The derived OIS id arrives on a response header rather than in the body,
  // so unlike the passport there is nothing to strip out of the payload.
  if (config.ois) {
    readOISHeader(config, new URL(request.url).pathname, response.headers);
  }

  return data;
}

export { fetch, buildRequest };
export default fetch;
