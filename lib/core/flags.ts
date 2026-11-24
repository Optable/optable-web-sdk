const FLAG_KEYS = [
  "optableDebug",
  "optableDisableConsent",
  "optableResolve1P",
  "optableResolve3P",
  "optableEnableAnalytics",
  "optableControlGroup",
  "optableForceTargeting",
  "optableForceGlobalRouting",
  "optableForceSkipMerge",
  "optableForceTokenize",
  "optableResolveId5",
  "optableResolveID5ID",
] as const;

export type FlagKey = (typeof FLAG_KEYS)[number];
export type Flags = Partial<Record<FlagKey, string>>;

// Reads the given keys from the URL query string (a bare key means "1") and
// persists them to sessionStorage for the rest of the tab session. Exported
// for wrapper bundles with keys of their own outside FLAG_KEYS.
export function persistFlagsFromURL(keys: readonly string[]): Record<string, string> {
  const found: Record<string, string> = {};

  try {
    const params = new URLSearchParams(window.location.search);
    for (const key of keys) {
      if (params.has(key)) {
        found[key] = params.get(key) || "1";
      }
    }
  } catch {
    // URL params unavailable
  }

  try {
    for (const key of Object.keys(found)) {
      sessionStorage.setItem(key, found[key]);
    }
  } catch {
    // sessionStorage unavailable
  }

  return found;
}

function parseFlags(): Flags {
  const flags: Flags = persistFlagsFromURL(FLAG_KEYS);

  try {
    for (const key of FLAG_KEYS) {
      if (!(key in flags)) {
        const val = sessionStorage.getItem(key);
        if (val !== null) {
          flags[key] = val;
        }
      }
    }
  } catch {
    // sessionStorage unavailable
  }

  return flags;
}

let _flags: Flags | null = null;

export function getFlags(): Flags {
  if (!_flags) {
    _flags = parseFlags();
  }
  return _flags;
}

export function resetFlags(): void {
  _flags = null;
}

/*
 * True when a flag carries a value and is not explicitly disabled.
 *
 * Flags carry string values ("?optableDebug" and "?optableDebug=1" both yield
 * "1"), so a bare truthiness test treats the string "0" as enabled. Callers
 * that only care whether a flag is on should use this rather than testing the
 * raw value, so "?optableDebug=0" turns the flag off as a reader would expect.
 *
 * An empty value counts as disabled. A URL cannot produce one, but sessionStorage
 * written by other code can.
 *
 * Flags with more than two states — optableControlGroup, where "1" and "0"
 * select different variants — should read getFlags() and compare explicitly.
 */
export function flagEnabled(key: FlagKey): boolean {
  const value = getFlags()[key];
  return !!value && value !== "0";
}
