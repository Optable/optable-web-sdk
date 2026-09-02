import type { ResolvedConfig } from "../config";
import { LocalStorage } from "./storage";
import { generateOISKeys } from "./storage-keys";

// Readable on the response only because the node lists it in Access-Control-Expose-Headers.
const oisHeaderName = "X-Optable-OID";

const oisChangeEventName = "optable-ois:change";

// A custom header makes a request non-simple, so sending it where the node derives
// no id buys a CORS preflight for nothing — notably /config, on every page load.
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

function readOISHeader(config: ResolvedConfig, pathname: string, headers: Headers): void {
  if (!derivesOISID(pathname) || !config.consent.deviceAccess) {
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
    // Storage full or blocked (Safari private mode).
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
  const storage = new LocalStorage(config);
  if (storage.getOIS() === null) {
    return;
  }

  storage.clearOIS();
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
