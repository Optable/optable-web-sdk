// The blob is built as query-string style key=value pairs, then base64url
// encoded without padding into a single opaque param, readable by design.
//
// An absent key means "not collected", which is distinct from "collected as
// empty", so a collector that cannot read its signal returns undefined rather
// than an empty string.

type  SignalKey = "lang" | "tz" | "scr" | "mem" | "cores";
type Signals = Partial<Record<SignalKey, string>>;
type NavigatorWithDeviceMemory = Navigator & { deviceMemory?: number };
const NUMERIC_MAX = 1024;

const COLLECTORS: Record<SignalKey, () => string | undefined> = {
  lang: () => {
    const { languages, language } = navigator;
    return languages?.length ? languages.join(",") : language || undefined;
  },
  tz: () => Intl.DateTimeFormat().resolvedOptions().timeZone || undefined,
  scr: () => {
    const { width, height } = window.screen;
    return isDimension(width) && isDimension(height) ? `${width}x${height}` : undefined;
  },
  mem: () => numeric((navigator as NavigatorWithDeviceMemory).deviceMemory),
  cores: () => numeric(navigator.hardwareConcurrency),
};

function isDimension(value: number): boolean {
  return Number.isInteger(value) && value > 0;
}

function numeric(value: number | undefined): string | undefined {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > NUMERIC_MAX) {
    return undefined;
  }
  return `${value}`;
}

function collectSignals(): Signals {
  const signals: Signals = {};

  for (const key of Object.keys(COLLECTORS) as SignalKey[]) {
    try {
      const value = COLLECTORS[key]();
      if (value) {
        signals[key] = value;
      }
    } catch {
      // The API is absent or blocked by a privacy shield; treat the signal as
      // not collected and keep the remaining collectors running.
    }
  }

  return signals;
}

function encodeBase64URL(value: string): string {
  return btoa(value)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function encodeSignals(signals: Signals): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(signals)) {
    params.append(key, value);
  }

  const query = params.toString();
  return query ? encodeBase64URL(query) : "";
}

// Returns the encoded `sig` blob, or an empty string when no signal could be
// collected.
function deviceSignals(): string {
  return encodeSignals(collectSignals());
}

export { deviceSignals, collectSignals, encodeSignals };
export type { SignalKey, Signals };
