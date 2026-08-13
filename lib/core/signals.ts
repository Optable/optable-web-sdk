// The blob is built as query-string style key=value pairs, then base64url
// encoded without padding into a single opaque param, readable by design.
//
// An absent key means the signal was not forwarded, which is distinct from
// forwarding an empty value, so a reader that cannot read its signal returns
// undefined rather than an empty string.

import { encodeBase64URL } from "./base64";

type SignalKey = "lang" | "tz" | "scr" | "mem" | "cores";
type Signals = Partial<Record<SignalKey, string>>;
type NavigatorWithDeviceMemory = Navigator & { deviceMemory?: number };
const NUMERIC_MAX = 1024;

const READERS: Record<SignalKey, () => string | undefined> = {
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

function readSignals(): Signals {
  const signals: Signals = {};

  for (const key of Object.keys(READERS) as SignalKey[]) {
    try {
      const value = READERS[key]();
      if (value) {
        signals[key] = value;
      }
    } catch {
      // The API is absent or blocked by a privacy shield; treat the signal as
      // unavailable and keep the remaining readers running.
    }
  }

  return signals;
}

function encodeSignals(signals: Signals): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(signals)) {
    params.append(key, value);
  }

  const query = params.toString();
  return query ? encodeBase64URL(query) : "";
}

// Every signal is fixed for the lifetime of the page, so the blob is read once
// and reused rather than rebuilt on each request.
let blob: string | undefined;

// Returns the encoded `sig` blob to forward, or an empty string when no signal
// is available.
function deviceSignals(): string {
  blob ??= encodeSignals(readSignals());
  return blob;
}

export { deviceSignals, readSignals, encodeSignals };
