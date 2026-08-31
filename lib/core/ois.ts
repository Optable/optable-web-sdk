// The SDK's half of the Optable Identity System: stores the OIS id the node
// derives and replays it on later requests, so a browser keeps one identity
// where the HttpOnly OPTABLE_OID cookie is blocked.

import type { ResolvedConfig } from "../config";
import { LocalStorage } from "./storage";
import { generateOISKeys } from "./storage-keys";

// Readable on the response only because the node lists it in
// Access-Control-Expose-Headers.
const oisHeaderName = "X-Optable-OID";

const oisChangeEventName = "optable-ois:change";

// The endpoints where the node derives an id. A custom header makes a request
// non-simple, so sending it anywhere else buys a CORS preflight for nothing —
// notably /config, which runs on every page load.
const HEADER_PATHS = new Set(["/identify", "/uid2/token", "/profile", "/v2/targeting"]);

function derivesOISID(pathname: string): boolean {
  return HEADER_PATHS.has(pathname);
}

type OISState = {
  id: string | null;
  storageKey: string;
};

function getOISID(config: ResolvedConfig): string | null {
  return new LocalStorage(config).getOIS();
}

function oisStorageKey(config: ResolvedConfig): string {
  return generateOISKeys(config).write[0];
}

// An absent header is not an instruction to forget: the node omits it on
// endpoints that derive no id, and on requests it declines to derive for.
function readOISHeader(config: ResolvedConfig, pathname: string, headers: Headers): void {
  if (!derivesOISID(pathname)) {
    return;
  }

  // LocalStorageProxy discards the write without consent, so bail before firing
  // a change event that reports nothing changed.
  if (!config.consent.deviceAccess) {
    return;
  }

  const id = headers.get(oisHeaderName);
  if (!id) {
    return;
  }

  const storage = new LocalStorage(config);
  if (storage.getOIS() === id) {
    return;
  }

  try {
    storage.setOIS(id);
  } catch {
    // Storage full or blocked (Safari private mode); a failed write must not
    // break the response.
    return;
  }

  notifyChange(config, { id, storageKey: oisStorageKey(config) });
}

function oisRequestID(config: ResolvedConfig, pathname: string): string | null {
  if (!derivesOISID(pathname) || !config.consent.deviceAccess) {
    return null;
  }

  return getOISID(config);
}

function clearOISID(config: ResolvedConfig): void {
  new LocalStorage(config).clearOIS();
  notifyChange(config, { id: null, storageKey: oisStorageKey(config) });
}

function getOISState(config: ResolvedConfig): OISState {
  return { id: getOISID(config), storageKey: oisStorageKey(config) };
}

function notifyChange(config: ResolvedConfig, state: OISState): void {
  window.dispatchEvent(
    new CustomEvent(oisChangeEventName, {
      detail: { instance: config.node || config.host, ...state },
    })
  );
}

export { oisHeaderName, readOISHeader, oisRequestID, getOISID, getOISState, clearOISID };
export type { OISState };
