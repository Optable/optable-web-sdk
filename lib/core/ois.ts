// The SDK's half of the Optable Identity System.
//
// A node recognizes a browser two ways, and only the second needs anything from
// here. The cookie identity in OPTABLE_OID rides along on its own and is HttpOnly,
// so it could not be read even if it did. The derived identity is the one we
// hold: the node derives it from the `sig` signals and returns it on
// X-Optable-OID, and without a stored copy every visit looks like a new device.
//
// See the OIS section of README.md for the integrator-facing description.

import type { ResolvedConfig } from "../config";
import { LocalStorage } from "./storage";
import { generateOISKeys } from "./storage-keys";

// Carries the derived OIS id in both directions. Readable on the response only
// because the node lists it in Access-Control-Expose-Headers.
const oisHeaderName = "X-Optable-OID";

// Not exported, matching the targeting change event in ./events/cache-refresh.ts:
// consumers listen for the literal name.
const oisChangeEventName = "optable-ois:change";

// The endpoints where the node derives an OIS id, and therefore the only
// ones that carry the header in either direction. A custom header makes a
// request non-simple, so sending it anywhere else buys a CORS preflight for
// nothing — hence no /config, which also means the id does not arrive until the
// first identify, targeting or profile call. /witness is absent too: it records
// an event without deriving an id.
const HEADER_PATHS = new Set(["/identify", "/uid2/token", "/sync", "/profile", "/v2/targeting"]);

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

// Stores the id from this response, replacing any previous one. The node always
// returns the derivation for the current request, so there is no policy to apply
// and drifting signals just roll the stored value forward.
//
// An absent header is not an instruction to forget: the node omits it on
// endpoints that derive no id, and on requests it declines to derive for (a
// non-residential IP, or OIS ID derivation switched off for the node).
function readOISHeader(config: ResolvedConfig, pathname: string, headers: Headers): void {
  if (!derivesOISID(pathname)) {
    return;
  }

  // Without device access consent LocalStorageProxy discards the write silently,
  // so bail before firing a change event that reports nothing changed.
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
    // Storage is full or blocked (Safari private mode). A failed write must not
    // break the response.
    return;
  }

  notifyChange(config);
}

function oisRequestID(config: ResolvedConfig, pathname: string): string | null {
  if (!derivesOISID(pathname)) {
    return null;
  }

  return getOISID(config);
}

function clearOISID(config: ResolvedConfig): void {
  new LocalStorage(config).clearOIS();
  notifyChange(config);
}

function getOISState(config: ResolvedConfig): OISState {
  return {
    id: getOISID(config),
    storageKey: generateOISKeys(config).write[0],
  };
}

function notifyChange(config: ResolvedConfig): void {
  // `instance` mirrors the targeting change event, so a page running several SDK
  // instances can tell which node fired.
  window.dispatchEvent(
    new CustomEvent(oisChangeEventName, {
      detail: { instance: config.node || config.host, ...getOISState(config) },
    })
  );
}

export { oisHeaderName, readOISHeader, oisRequestID, getOISID, getOISState, clearOISID };
export type { OISState };
