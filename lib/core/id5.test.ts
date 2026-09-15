import { getCachedId5UserId, resolveId5, ID5_CACHE_KEY } from "./id5";
import { resetFlags } from "./flags";

type Id5Mock = {
  debug?: boolean;
  init: jest.Mock;
};

function injectedScript(): HTMLScriptElement {
  const script = document.head.querySelector("script[src*='id5-sync.com']") as HTMLScriptElement;
  expect(script).not.toBeNull();
  return script;
}

// Simulates the ID5 API loading and invoking onUpdate on an instance that
// returns the given user id under the given partner id.
function loadId5(partnerId: number | string, userId: string | undefined): Id5Mock {
  const instance = {
    config: { providedOptions: { partnerId } },
    getUserId: () => userId,
    onUpdate: (cb: () => void) => {
      cb();
      return instance;
    },
  };
  const id5: Id5Mock = { init: jest.fn(() => instance) };
  (window as any).ID5 = id5;
  injectedScript().onload?.(new Event("load"));
  return id5;
}

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  resetFlags();
  document.head.querySelectorAll("script").forEach((s) => s.remove());
  delete (window as any).ID5;
});

describe("getCachedId5UserId", () => {
  it("returns a cached id within the TTL and null past it", () => {
    localStorage.setItem(ID5_CACHE_KEY, JSON.stringify({ userId: "id5-x", resolvedAt: Date.now() }));
    expect(getCachedId5UserId()).toBe("id5-x");

    localStorage.setItem(
      ID5_CACHE_KEY,
      JSON.stringify({ userId: "id5-x", resolvedAt: Date.now() - 8 * 24 * 60 * 60 * 1000 })
    );
    expect(getCachedId5UserId()).toBeNull();
  });

  it("tolerates a malformed cache", () => {
    localStorage.setItem(ID5_CACHE_KEY, "{nope");
    expect(getCachedId5UserId()).toBeNull();
  });
});

describe("resolveId5", () => {
  it("returns the QA id from optableResolveID5ID without loading the API", async () => {
    sessionStorage.setItem("optableResolveID5ID", "qa-id5-value");
    resetFlags();
    await expect(resolveId5(42)).resolves.toBe("qa-id5-value");
    expect(document.head.querySelector("script")).toBeNull();
  });

  it("returns the placeholder for optableResolveId5", async () => {
    sessionStorage.setItem("optableResolveId5", "1");
    resetFlags();
    await expect(resolveId5(42)).resolves.toBe("ID5-QA");
  });

  it("returns the cached id without loading the API", async () => {
    localStorage.setItem(ID5_CACHE_KEY, JSON.stringify({ userId: "cached-id5", resolvedAt: Date.now() }));
    await expect(resolveId5(42)).resolves.toBe("cached-id5");
    expect(document.head.querySelector("script")).toBeNull();
  });

  it("skips live resolution for bots", async () => {
    await expect(resolveId5(42, { isBot: () => true })).resolves.toBeNull();
    expect(document.head.querySelector("script")).toBeNull();
  });

  it("resolves a live id and caches it", async () => {
    const pending = resolveId5(42);
    loadId5(42, "live-id5");

    await expect(pending).resolves.toBe("live-id5");
    expect(getCachedId5UserId()).toBe("live-id5");
  });

  it("rejects a partner id mismatch", async () => {
    const pending = resolveId5(42);
    loadId5(99, "live-id5");

    await expect(pending).resolves.toBeNull();
    expect(getCachedId5UserId()).toBeNull();
  });

  it("rejects the ID5 '0' placeholder", async () => {
    const pending = resolveId5(42);
    loadId5(42, "0");

    await expect(pending).resolves.toBeNull();
  });

  it("resolves null when the API fails to load", async () => {
    const pending = resolveId5(42);
    injectedScript().onerror?.(new Event("error"));

    await expect(pending).resolves.toBeNull();
  });

  it("gives up after the timeout when onUpdate never fires", async () => {
    await expect(resolveId5(42, { timeoutMs: 20 })).resolves.toBeNull();
  });
});
