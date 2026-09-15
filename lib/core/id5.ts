import { debugLog } from "./log";
import { flagEnabled, getFlags } from "./flags";

// Resolves an ID5 user id, loading the ID5 API on demand. Resolution order:
// QA flags, then the local cache (7-day TTL, its own storage key — never
// piggybacked on cached EIDs), then a live resolution. ID5's own A/B holdout
// is disabled so every consented user gets an id.

const ID5_API_URL = "https://cdn.id5-sync.com/api/1.0/id5-api.js";
const ID5_CACHE_KEY = "OPTABLE_ID5";
const ID5_TTL_MS = 7 * 24 * 60 * 60 * 1000;
// Live resolution is bounded: ID5's onUpdate is not guaranteed to fire, and
// callers await this before targeting.
const DEFAULT_TIMEOUT_MS = 10_000;

type Id5Options = {
  // Skip live resolution (returning null) when true — wire to the bot
  // detection addon's isBot.
  isBot?: () => boolean;
  // Give up on live resolution after this long. Defaults to 10s.
  timeoutMs?: number;
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

export function getCachedId5UserId(): string | null {
  try {
    const cached = JSON.parse(localStorage.getItem(ID5_CACHE_KEY) || "null");
    if (typeof cached?.userId === "string" && cached.userId && Date.now() - cached.resolvedAt < ID5_TTL_MS) {
      return cached.userId;
    }
  } catch {
    // Unparseable cache; resolve live.
  }
  return null;
}

function cacheId5UserId(userId: string): void {
  try {
    localStorage.setItem(ID5_CACHE_KEY, JSON.stringify({ userId, resolvedAt: Date.now() }));
  } catch {
    // Storage unavailable; the id still resolves for this page.
  }
}

export function resolveId5(partnerId: number | string, options: Id5Options = {}): Promise<string | null> {
  // QA: inject a specific value, or a placeholder, without loading the API.
  const qaId5 = getFlags().optableResolveID5ID;
  if (qaId5 && qaId5 !== "1") {
    debugLog("log", "ID5: using QA id");
    return Promise.resolve(qaId5);
  }
  if (flagEnabled("optableResolveId5")) {
    debugLog("log", "ID5: using QA value");
    return Promise.resolve("ID5-QA");
  }

  const cached = getCachedId5UserId();
  if (cached) {
    debugLog("log", "ID5: using cached value");
    return Promise.resolve(cached);
  }

  if (options.isBot?.()) {
    debugLog("log", "ID5: skipped (bot)");
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
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

    const script = document.createElement("script");
    script.src = ID5_API_URL;
    script.onload = () => {
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
        if (instance.config?.providedOptions?.partnerId !== partnerId) {
          debugLog(
            "warn",
            `ID5: partner id mismatch: ${instance.config?.providedOptions?.partnerId} instead of ${partnerId}`
          );
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
        cacheId5UserId(id5Id);
        settle(id5Id);
      });
    };
    script.onerror = () => {
      debugLog("warn", "ID5: API load failed");
      settle(null);
    };
    document.head.appendChild(script);
  });
}

export { ID5_CACHE_KEY, ID5_API_URL };
