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

function parseFlags(): Flags {
  const flags: Flags = {};

  try {
    const params = new URLSearchParams(window.location.search);
    for (const key of FLAG_KEYS) {
      if (params.has(key)) {
        flags[key] = params.get(key) || "1";
      }
    }
  } catch {
    // URL params unavailable
  }

  // Persist URL-supplied flags so a flag set once survives navigation within
  // the session, rather than only applying to the page it was set on.
  try {
    for (const key of Object.keys(flags) as FlagKey[]) {
      sessionStorage.setItem(key, flags[key] as string);
    }
  } catch {
    // sessionStorage unavailable
  }

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
