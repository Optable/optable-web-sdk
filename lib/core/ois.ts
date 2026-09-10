import type { ResolvedConfig } from "../config";
import { LocalStorage } from "./storage";

const oisHeaderName = "X-Optable-OID";

const oisChangeEventName = "optable-ois:change";

const HEADER_PATHS = new Set(["/identify", "/uid2/token", "/profile"]);

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
    // Storage full or blocked.
    return;
  }

  notifyChange(config, { id, storageKey: storage.oisKey() });
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
  notifyChange(config, { id: null, storageKey: storage.oisKey() });
}

function getOISState(config: ResolvedConfig): OISState {
  const storage = new LocalStorage(config);
  return { id: storage.getOIS(), storageKey: storage.oisKey() };
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
