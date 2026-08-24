// The OIS id identifies a browser to the Optable Identity System. The edge
// normally carries it in the OPTABLE_OID cookie, but that cookie is third-party
// (Domain=optable.co, SameSite=None) so it is dropped wherever cross-site
// cookies are blocked. There the edge mints a throwaway id on every request and
// the browser is unrecognizable between calls.
//
// This module keeps the id the edge reports in localStorage and replays it on
// the X-Optable-OID header, so a browser keeps one identity when the cookie is
// unavailable. The edge reads the cookie before the header, so the header is a
// fallback and never an override.
//
// The cookie is HttpOnly, so the id can never be read from document.cookie. The
// only way a browser learns the id it was assigned is the ois_id response field.

import type { ResolvedConfig } from "../config";
import { LocalStorage } from "./storage";
import { generateOISKeys } from "./storage-keys";

// Carries a stored id back to the edge. Already allowed by the edge CORS policy.
const oisHeaderName = "X-Optable-OID";

// Dispatched on window whenever the stored id changes, so a page can react
// without polling. Mirrors the targeting cache-refresh event.
const oisChangeEventName = "optable-ois:change";

const envelopeVersion = 1;

// The transport the edge resolved an id from, as reported in oid_source.
type OISIDSource = "cookie" | "header" | "minted";

// What a browser can conclude about which transport is carrying its id.
type OISTransport = "cookie" | "localstorage" | "unknown";

type OISEnvelope = {
  v: number;
  id: string;
  // The source reported when this id was stored, not necessarily the source of
  // the most recent request.
  source: OISIDSource;
  ts: number;
};

type OISState = {
  id: string | null;
  source: OISIDSource | null;
  transport: OISTransport;
  storageKey: string;
  // Whether the last write attempt reached localStorage: null until one has
  // been attempted. Reported rather than probed, because probing would itself
  // write to storage and there is no consent to do so just to answer this.
  storageWritable: boolean | null;
  updatedAt: number | null;
};

// Endpoints that replay the header. Restricted to the endpoints where the edge
// attaches the OIS id to the event it records, because a custom header makes a
// request non-simple and forces a CORS preflight.
//
// /config is deliberately absent: it runs on the SDK init path, so a preflight
// there is paid on every page load, and the edge does not record an event for
// it. Skipping it means the edge mints a throwaway id for /config on a browser
// with no cookie, which is why a minted id never overwrites a stored one.
const REPLAY_PATHS = new Set(["/identify", "/sync", "/uid2/token", "/v2/targeting", "/witness", "/profile"]);

function isReplayPath(pathname: string): boolean {
  return REPLAY_PATHS.has(pathname);
}

function isSource(value: unknown): value is OISIDSource {
  return value === "cookie" || value === "header" || value === "minted";
}

// A stored value is only usable if it round-trips to an envelope with an id. A
// malformed or hand-edited value is treated as absent rather than throwing.
function parseEnvelope(raw: string | null): OISEnvelope | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.id !== "string" || !parsed.id) {
      return null;
    }
    return {
      v: typeof parsed.v === "number" ? parsed.v : envelopeVersion,
      id: parsed.id,
      source: isSource(parsed.source) ? parsed.source : "minted",
      ts: typeof parsed.ts === "number" ? parsed.ts : 0,
    };
  } catch {
    return null;
  }
}

function readEnvelope(config: ResolvedConfig): OISEnvelope | null {
  return parseEnvelope(new LocalStorage(config).getOIS());
}

// Whether the last write attempt reached localStorage. Module-level so that
// state can report it without writing a probe of its own.
let lastWriteOK: boolean | null = null;

// Reports whether the write landed. LocalStorage throws when storage is full or
// blocked (Safari private mode), and a failed write must not break the request.
function writeEnvelope(config: ResolvedConfig, envelope: OISEnvelope): boolean {
  // Without device access consent LocalStorageProxy silently discards the
  // write, so treat it as a failure rather than reporting a phantom success.
  if (!config.consent.deviceAccess) {
    lastWriteOK = false;
    return false;
  }

  try {
    new LocalStorage(config).setOIS(JSON.stringify(envelope));
    lastWriteOK = true;
  } catch {
    lastWriteOK = false;
  }

  return lastWriteOK;
}

// Decides whether an id the edge just reported replaces the stored one.
//
// A cookie-sourced id is authoritative: storing it is what lets the same
// identity survive the cookie being blocked later, which is the whole point of
// the module. A header-sourced id is the one just sent, so there is nothing new
// to record. A minted id means neither transport carried an id, which happens on
// a first visit and on every request to an endpoint that does not replay the
// header, so it may only bootstrap an empty slot -- overwriting on a mint would
// churn the id on every page load.
function shouldStore(incoming: OISIDSource, stored: OISEnvelope | null): boolean {
  switch (incoming) {
    case "cookie":
      return true;
    case "header":
      return false;
    case "minted":
      return stored === null;
  }
}

type OISResponseFields = {
  ois_id?: unknown;
  oid_source?: unknown;
};

// Consumes the ois_id/oid_source fields from a response body, applying them to
// storage and then removing them.
//
// The fields are deleted for the same reason the passport is: a /v2/targeting or
// /config payload is handed to ad servers and written to the targeting cache, so
// anything left on it leaks.
function applyOISResponse(config: ResolvedConfig, data: OISResponseFields): void {
  const id = data.ois_id;
  const source = data.oid_source;

  delete data.ois_id;
  delete data.oid_source;

  if (typeof id !== "string" || !id || !isSource(source)) {
    return;
  }

  const stored = readEnvelope(config);
  if (!shouldStore(source, stored)) {
    return;
  }

  // Storing an identical id would rewrite the same value on every request for
  // the whole of a cookie-backed session.
  if (stored && stored.id === id && stored.source === source) {
    return;
  }

  if (writeEnvelope(config, { v: envelopeVersion, id, source, ts: Date.now() })) {
    notifyChange(config);
  }
}

// Returns the id to replay on this request, or null when there is nothing to
// send or the endpoint does not replay.
function oisRequestID(config: ResolvedConfig, pathname: string): string | null {
  if (!isReplayPath(pathname)) {
    return null;
  }

  return readEnvelope(config)?.id ?? null;
}

// A minted id means the edge saw no cookie and no header. On a first visit that
// is expected and says nothing about whether cookies work; on a later visit it
// means the cookie was dropped. The two are indistinguishable from the browser,
// so a mint reports "unknown" rather than guessing.
function transportOf(source: OISIDSource | null): OISTransport {
  switch (source) {
    case "cookie":
      return "cookie";
    case "header":
      return "localstorage";
    default:
      return "unknown";
  }
}

function getOISState(config: ResolvedConfig): OISState {
  const envelope = readEnvelope(config);

  return {
    id: envelope?.id ?? null,
    source: envelope?.source ?? null,
    transport: transportOf(envelope?.source ?? null),
    storageKey: generateOISKeys(config).write[0],
    storageWritable: lastWriteOK,
    updatedAt: envelope?.ts ?? null,
  };
}

function getOISID(config: ResolvedConfig): string | null {
  return readEnvelope(config)?.id ?? null;
}

function clearOISID(config: ResolvedConfig): void {
  new LocalStorage(config).clearOIS();
  notifyChange(config);
}

function notifyChange(config: ResolvedConfig): void {
  try {
    window.dispatchEvent(new CustomEvent(oisChangeEventName, { detail: getOISState(config) }));
  } catch {
    // A missing CustomEvent constructor must not break a request.
  }
}

export {
  oisHeaderName,
  oisChangeEventName,
  applyOISResponse,
  oisRequestID,
  getOISState,
  getOISID,
  clearOISID,
  shouldStore,
  parseEnvelope,
  isReplayPath,
};
export type { OISState, OISEnvelope, OISIDSource, OISTransport };
