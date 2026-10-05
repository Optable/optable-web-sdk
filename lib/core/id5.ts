import { debugLog } from "./log";
import { flagEnabled, getFlags } from "./flags";

// Resolves an ID5 user id, loading the ID5 API on demand. Resolution order:
// QA flags, then the local cache (7-day TTL, one storage key per partner —
// never piggybacked on cached EIDs), then a live resolution. ID5's own holdout
// is disabled so every consented user gets an id.
//
// The cache is raw localStorage, not a LocalStorageProxy. Every read and
// write takes a deviceAccess gate; pass sdk.dcn.consent.deviceAccess.

const ID5_API_URL = "https://cdn.id5-sync.com/api/1.0/id5-api.js";
const ID5_CACHE_KEY = "OPTABLE_ID5";
const ID5_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
// Live resolution is bounded: ID5's onUpdate is not guaranteed to fire, and
// callers await this before targeting.
const DEFAULT_TIMEOUT_MS = 2_000;

type Id5Options = {
  // Skip live resolution (returning null) when true — wire to the bot
  // detection addon's isBot.
  isBot?: () => boolean;
  // Give up on live resolution after this long. Defaults to 2s.
  timeoutMs?: number;
  // Gate the cache on device-access consent: pass sdk.dcn.consent.deviceAccess.
  // Skips both read and write when false. Defaults to allowed, as the SDK does.
  deviceAccess?: () => boolean;
};

type Id5Instance = {
  config?: { providedOptions?: { partnerId?: number | string } };
  getUserId: () => string | undefined;
  onUpdate: (cb: () => void) => Id5Instance;
};

declare global {
  interface Window {
    ID5?: {
      debug?: boolean;
      init: (options: Record<string, unknown>) => Id5Instance;
    };
  }
}

// Partner ids are compared as strings throughout: a caller reading the id from
// a DOM attribute or JSON config passes "42" where another passed 42.
const partnerKey = (partnerId: number | string | undefined): string => String(partnerId);

// Each partner gets its own entry, so several partner ids on one page cache
// alongside each other instead of evicting one another.
const cacheKeyFor = (partnerId: number | string): string => `${ID5_CACHE_KEY}:${partnerKey(partnerId)}`;

// deviceAccess is required rather than defaulted so a caller cannot read a
// user id out of storage without stating a consent position.
export function getCachedId5UserId(partnerId: number | string, deviceAccess: () => boolean): string | null {
  if (!deviceAccess()) {
    return null;
  }

  try {
    const cached = JSON.parse(localStorage.getItem(cacheKeyFor(partnerId)) || "null");
    if (typeof cached?.userId === "string" && cached.userId && Date.now() - cached.resolvedAt < ID5_TTL_MS) {
      return cached.userId;
    }
  } catch {
    // Unparseable cache; resolve live.
  }
  return null;
}

function cacheId5UserId(partnerId: number | string, userId: string, deviceAccess: () => boolean): void {
  if (!deviceAccess()) {
    return;
  }

  try {
    localStorage.setItem(cacheKeyFor(partnerId), JSON.stringify({ userId, resolvedAt: Date.now() }));
  } catch {
    // Storage unavailable; the id still resolves for this page.
  }
}

const pending = new Map<string, Promise<string | null>>();

export function resolveId5(partnerId: number | string, options: Id5Options = {}): Promise<string | null> {
  // QA: inject a specific value, or a placeholder, without loading the API.
  // A bare flag ("1") and "0" (the flag-disable convention, also ID5's
  // invalid placeholder) do not count as injected values.
  const qaId5 = getFlags().optableResolveID5ID;
  if (qaId5 && qaId5 !== "1" && qaId5 !== "0") {
    debugLog("log", "ID5: using QA id");
    return Promise.resolve(qaId5);
  }
  if (flagEnabled("optableResolveId5")) {
    debugLog("log", "ID5: using QA value");
    return Promise.resolve("ID5-QA");
  }

  // Re-evaluated at write time too, so consent withdrawn mid-resolution stops the write.
  const deviceAccess = options.deviceAccess ?? (() => true);
  const cached = getCachedId5UserId(partnerId, deviceAccess);
  if (cached) {
    debugLog("log", "ID5: using cached value");
    return Promise.resolve(cached);
  }

  if (options.isBot?.()) {
    debugLog("log", "ID5: skipped (bot)");
    return Promise.resolve(null);
  }

  // Concurrent callers share one script load and one resolution, per partner.
  const key = partnerKey(partnerId);
  const inflight = pending.get(key);
  if (inflight) {
    return inflight;
  }

  const promise = new Promise<string | null>((resolve) => {
    let settled = false;
    const settle = (value: string | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      resolve(value);
    };
    const timeoutId = setTimeout(() => {
      debugLog("warn", "ID5: timed out");
      settle(null);
    }, options.timeoutMs ?? DEFAULT_TIMEOUT_MS);

    const init = () => {
      // An ID5.init throw must settle rather than stall until the timeout.
      try {
        debugLog("log", "ID5 library init");
        if (!window.ID5) {
          settle(null);
          return;
        }
        if (flagEnabled("optableDebug")) {
          window.ID5.debug = true;
        }

        const instance = window.ID5.init({
          partnerId,
          debugBypassConsent: flagEnabled("optableDisableConsent"),
          abTesting: { enabled: false, controlGroupPct: 0 },
        });
        instance.onUpdate(() => {
          const resolvedPartner = instance.config?.providedOptions?.partnerId;
          if (partnerKey(resolvedPartner) !== key) {
            debugLog("warn", `ID5: partner id mismatch: ${resolvedPartner} instead of ${partnerId}`);
            settle(null);
            return;
          }

          const id5Id = instance.getUserId();
          if (!id5Id || id5Id === "0") {
            debugLog("log", "ID5: invalid value");
            settle(null);
            return;
          }
          debugLog("log", `ID5: resolved ${id5Id}`);
          // An onUpdate arriving after the timeout still caches, so the next
          // call gets the id rather than resolving again.
          cacheId5UserId(partnerId, id5Id, deviceAccess);
          settle(id5Id);
        });
      } catch (err) {
        debugLog("warn", "ID5: init failed", err);
        settle(null);
      }
    };

    // Reuse an API the page or an earlier resolution already loaded, rather
    // than downloading it again.
    if (window.ID5) {
      init();
      return;
    }

    const script = document.createElement("script");
    script.src = ID5_API_URL;
    script.onload = init;
    script.onerror = () => {
      debugLog("warn", "ID5: API load failed");
      settle(null);
    };
    document.head.appendChild(script);
  });

  pending.set(key, promise);
  promise.finally(() => {
    if (pending.get(key) === promise) {
      pending.delete(key);
    }
  });
  return promise;
}

export { ID5_CACHE_KEY, ID5_API_URL };
