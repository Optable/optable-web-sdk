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

// A response body, and the passport that came on it.
type Answer<T> = { data: T; passport?: string };

async function send<T>(path: string, config: ResolvedConfig, init?: RequestInit): Promise<Answer<T>> {
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

  const passport: string | undefined = data.passport;
  if (passport) {
    // We delete the passport attribute from the returned payload. This is because
    // the targeting edge handler was initially made to return targeting data directly
    // in the form of 'key values' on the returned JSON payload -- if we don't delete
    // the `passport` attribute here, it may end up sent as targeting data to ad servers.
    // Not the end of the world, but something we want to avoid due to passport size.
    delete data.passport;
  }

  return { data, passport };
}

// How long a mint holds the others back before the next request takes it over.
const MINT_WAIT_MS = 2000;

// The edge answers these without a passport, so they never lead a mint.
const NON_MINTING_PATHS = new Set(["/v1beta1/contextual", "/v1/resolve"]);

type Mint = { settled: Promise<void>; expires: number };

// The edge mints a visitor for every request that arrives without a passport.
// While none is stored, one request per passport storage key goes out alone
// and the rest wait to send the passport it stores.
const minting = new Map<string, Mint>();
// Mints answered without a passport, as "<storage key> <pathname>": the same
// request leading again would hold the others back for nothing.
const unminted = new Set<string>();

// The storage key a request sent now would be minted a passport under, if any.
function mintKey(config: ResolvedConfig): string | undefined {
  // Cookie mode sends no passport, and without device access none is stored.
  if (config.cookies || !config.consent.deviceAccess) {
    return undefined;
  }

  const ls = new LocalStorage(config);
  return ls.getPassport() ? undefined : ls.passportKey();
}

function canMint(key: string, pathname: string): boolean {
  return !NON_MINTING_PATHS.has(pathname) && !unminted.has(`${key} ${pathname}`);
}

async function leadMint<T>(
  key: string,
  pathname: string,
  config: ResolvedConfig,
  request: () => Promise<Answer<T>>
): Promise<T> {
  let release!: () => void;
  const mint: Mint = {
    settled: new Promise((resolve) => (release = resolve)),
    expires: Date.now() + MINT_WAIT_MS,
  };
  minting.set(key, mint);

  try {
    const { data, passport } = await request();
    const ls = new LocalStorage(config);
    const current = minting.get(key);
    if (!passport) {
      unminted.add(`${key} ${pathname}`);
    } else if (current === mint || (!current && !ls.getPassport())) {
      // Once taken over, a mint leaves storing the passport to its successor.
      ls.setPassport(passport);
    }
    return data;
  } finally {
    if (minting.get(key) === mint) {
      minting.delete(key);
    }
    release();
  }
}

async function fetch<T>(path: string, config: ResolvedConfig, init?: RequestInit): Promise<T> {
  const pathname = path.split("?")[0];

  for (let key = mintKey(config); key; key = mintKey(config)) {
    const mint = minting.get(key);
    const remaining = mint ? mint.expires - Date.now() : 0;
    if (!mint || remaining <= 0) {
      if (!canMint(key, pathname)) {
        break;
      }
      return leadMint(key, pathname, config, () => send<T>(path, config, init));
    }

    let timer: ReturnType<typeof setTimeout> | undefined;
    await Promise.race([mint.settled, new Promise((resolve) => (timer = setTimeout(resolve, remaining)))]);
    clearTimeout(timer);
  }

  // Built only now, so a request that waited sends the passport just stored.
  const { data, passport } = await send<T>(path, config, init);
  if (passport) {
    new LocalStorage(config).setPassport(passport);
  }
  return data;
}

export { fetch, buildRequest };
export default fetch;
