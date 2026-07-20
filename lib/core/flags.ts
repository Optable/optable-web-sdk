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
