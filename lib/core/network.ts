import type { ResolvedConfig } from "../config";
import { default as buildInfo } from "../build.json";
import { LocalStorage } from "./storage";
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

  const requestInit: RequestInit = { ...init };
  requestInit.credentials = config.consent.deviceAccess ? "include" : "omit";
  const headers = new Headers(requestInit.headers);
  requestInit.headers = headers;

  if (config.mockedIP) {
    headers.set("X-Forwarded-For", config.mockedIP);
  }

  if (config.ois) {
    const oisID = oisRequestID(config, url.pathname);
    if (oisID) {
      try {
        headers.set(oisHeaderName, oisID);
      } catch {
        // A stored value carrying characters a header cannot hold must not brick every call.
      }
    }
  }

  const request = new Request(url.toString(), requestInit);

  return request;
}

async function send<T>(path: string, config: ResolvedConfig, init?: RequestInit): Promise<T> {
  const request = buildRequest(path, config, init);
  const response = await globalThis.fetch(request);

  // Ahead of the error throw below: a non-2xx can still carry a derived id.
  if (config.ois) {
    readOISHeader(config, new URL(request.url).pathname, response.headers);
  }

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

// Longest a request waits on the mint ahead of it before going out without a passport.
const MINT_WAIT_MS = 2000;

// The edge mints a visitor for every request that arrives without a passport.
// While none is stored, one request per passport storage key goes out alone
// and the rest wait to send the passport it stores.
const minting = new Map<string, Promise<void>>();
// Keys whose mint was answered without a passport: waiting there gains nothing.
const unminted = new Set<string>();

// The storage key a request sent now would be minted a passport under, if any.
function mintKey(config: ResolvedConfig): string | undefined {
  // Cookie mode sends no passport, and without device access none is stored.
  if (config.cookies || !config.consent.deviceAccess) {
    return undefined;
  }

  const ls = new LocalStorage(config);
  const key = ls.passportKey();
  return ls.getPassport() || unminted.has(key) ? undefined : key;
}

async function leadMint<T>(key: string, config: ResolvedConfig, request: () => Promise<T>): Promise<T> {
  let release!: () => void;
  minting.set(key, new Promise((resolve) => (release = resolve)));

  try {
    const data = await request();
    if (!new LocalStorage(config).getPassport()) {
      unminted.add(key);
    }
    return data;
  } finally {
    minting.delete(key);
    release();
  }
}

async function fetch<T>(path: string, config: ResolvedConfig, init?: RequestInit): Promise<T> {
  const deadline = Date.now() + MINT_WAIT_MS;

  for (let key = mintKey(config); key; key = mintKey(config)) {
    const leader = minting.get(key);
    if (!leader) {
      return leadMint(key, config, () => send<T>(path, config, init));
    }

    const remaining = deadline - Date.now();
    if (remaining <= 0) {
      break;
    }
    let timer: ReturnType<typeof setTimeout> | undefined;
    await Promise.race([leader, new Promise((resolve) => (timer = setTimeout(resolve, remaining)))]);
    clearTimeout(timer);
  }

  // Built only now, so a request that waited sends the passport just stored.
  return send(path, config, init);
}

export { fetch, buildRequest };
export default fetch;
