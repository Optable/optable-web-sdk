import { trackUid2Refresh, uid2RefreshIdle } from "./uid2-refresh-lock";

function deferred<T>() {
  let resolve!: (v: T) => void;
  let reject!: (e: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe("uid2RefreshIdle", () => {
  it("resolves immediately when no refresh is in flight", async () => {
    await expect(uid2RefreshIdle()).resolves.toBeUndefined();
  });

  it("waits until an in-flight refresh settles", async () => {
    const refresh = deferred<string>();
    const tracked = trackUid2Refresh(() => refresh.promise);

    let idle = false;
    const waiter = uid2RefreshIdle().then(() => {
      idle = true;
    });
    await Promise.resolve();
    expect(idle).toBe(false);

    refresh.resolve("done");
    await expect(tracked).resolves.toBe("done");
    await waiter;
    expect(idle).toBe(true);
  });

  it("waits for every overlapping refresh", async () => {
    const a = deferred<void>();
    const b = deferred<void>();
    trackUid2Refresh(() => a.promise);
    trackUid2Refresh(() => b.promise);

    let idle = false;
    const waiter = uid2RefreshIdle().then(() => {
      idle = true;
    });

    a.resolve();
    await Promise.resolve();
    await Promise.resolve();
    expect(idle).toBe(false);

    b.resolve();
    await waiter;
    expect(idle).toBe(true);
  });

  it("gives up after maxWaitMs when a refresh hangs", async () => {
    const hung = deferred<void>();
    trackUid2Refresh(() => hung.promise);

    const start = Date.now();
    await uid2RefreshIdle(20);
    expect(Date.now() - start).toBeLessThan(1000);

    hung.resolve();
  });

  it("releases when the refresh rejects", async () => {
    const refresh = deferred<void>();
    const tracked = trackUid2Refresh(() => refresh.promise);
    const waiter = uid2RefreshIdle();

    refresh.reject(new Error("boom"));
    await expect(tracked).rejects.toThrow("boom");
    await expect(waiter).resolves.toBeUndefined();
  });
});
