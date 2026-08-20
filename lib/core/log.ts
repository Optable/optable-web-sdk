import { flagEnabled } from "./flags";

// Level-aware console writer. Ungated — for callers with their own enablement
// logic, like the RTD module's enableLogging option.
function consoleLog(prefix: string, level: string, message: string, ...args: any[]): void {
  const logMethod = ["error", "warn", "info"].includes(level) ? level : "log";
  (console as any)[logMethod](`${prefix} ${message}`, ...args); // eslint-disable-line no-console
}

// Debug logger gated on the optableDebug flag (URL param or sessionStorage).
function debugLog(level: string, message: string, ...args: any[]): void {
  if (flagEnabled("optableDebug")) {
    consoleLog("Optable:", level, message, ...args);
  }
}

export { consoleLog, debugLog };
