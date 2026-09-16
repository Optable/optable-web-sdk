// Serializes targeting calls against in-flight UID2 refreshes. A refresh
// rewrites the cached uidapi.com EID and its refs entry; a targeting response
// landing mid-refresh could pair a fresh EID (possibly resolved by another
// matcher) with the stale refresh outcome. Refreshes register here, and
// targeting waits for idle before it fires.

let inFlight = 0;
let waiters: Array<() => void> = [];

export async function trackUid2Refresh<T>(refresh: () => Promise<T>): Promise<T> {
  inFlight += 1;
  try {
    return await refresh();
  } finally {
    inFlight -= 1;
    if (inFlight === 0) {
      const resolved = waiters;
      waiters = [];
      resolved.forEach((resolve) => resolve());
    }
  }
}

// Resolves once no refresh is in flight, or after maxWaitMs — the
// serialization is best-effort protection, and a hung refresh fetch must not
// block targeting for the rest of the page. Resolves immediately when idle.
export function uid2RefreshIdle(maxWaitMs?: number): Promise<void> {
  if (inFlight === 0) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    if (maxWaitMs === undefined) {
      waiters.push(resolve);
      return;
    }
    let settled = false;
    const timeoutId = setTimeout(() => {
      settled = true;
      resolve();
    }, maxWaitMs);
    waiters.push(() => {
      if (!settled) {
        clearTimeout(timeoutId);
        resolve();
      }
    });
  });
}
