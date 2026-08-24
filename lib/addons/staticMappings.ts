// Applies a wrapper's config defaults onto window.optable, so publisher-set
// values always win. When both sides are plain objects they merge recursively,
// covering nested config like analytics.*. Anything else is assigned as-is,
// and only when the current value is null or undefined, so publisher overrides
// of 0, "" and false survive.
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && Object.getPrototypeOf(value) === Object.prototype;
}

function applyDefaults(target: Record<string, unknown>, defaults: Record<string, unknown>): void {
  for (const key of Object.keys(defaults)) {
    const def = defaults[key];
    const cur = target[key];
    if (isPlainObject(def) && isPlainObject(cur)) {
      applyDefaults(cur, def);
    } else if (cur === null || cur === undefined) {
      target[key] = def;
    }
  }
}

function setStaticMappings(defaults: Record<string, unknown>): void {
  const w = window as unknown as { optable?: Record<string, unknown> };
  if (typeof w.optable !== "object" || w.optable === null) {
    w.optable = {};
  }
  applyDefaults(w.optable, defaults);
}

export { setStaticMappings };
