import { collectSignals, deviceSignals, encodeSignals } from "./signals";

const restores: Array<() => void> = [];

// Shadows a host property for one test. jsdom defines most of these on the
// prototype, so an absent own-descriptor restores by deletion.
function stub(target: object, prop: string, value: unknown) {
  const original = Object.getOwnPropertyDescriptor(target, prop);
  Object.defineProperty(target, prop, { value, configurable: true, writable: true });
  restores.push(() => {
    if (original) {
      Object.defineProperty(target, prop, original);
    } else {
      delete (target as Record<string, unknown>)[prop];
    }
  });
}

function stubDevice(signals: {
  languages?: readonly string[];
  timeZone?: string;
  width?: number;
  height?: number;
  deviceMemory?: number;
  cores?: number;
}) {
  stub(window.navigator, "languages", signals.languages ?? []);
  stub(window.navigator, "language", "");
  stub(window.navigator, "deviceMemory", signals.deviceMemory);
  stub(window.navigator, "hardwareConcurrency", signals.cores);
  stub(window.screen, "width", signals.width ?? 0);
  stub(window.screen, "height", signals.height ?? 0);
  jest.spyOn(Intl, "DateTimeFormat").mockImplementation(
    () => ({ resolvedOptions: () => ({ timeZone: signals.timeZone ?? "" }) }) as Intl.DateTimeFormat
  );
}

const fullDevice = {
  languages: ["en-US", "en"],
  timeZone: "America/Toronto",
  width: 3440,
  height: 1440,
  deviceMemory: 8,
  cores: 8,
};

afterEach(() => {
  while (restores.length) {
    restores.pop()!();
  }
  jest.restoreAllMocks();
});

// Locks the wire format: the blob is decoded as base64url without padding, so a
// padding or alphabet slip breaks silently.
it("encodes signals to base64url without padding", () => {
  const sig = encodeSignals({
    lang: "en-US,en",
    tz: "America/Toronto",
    scr: "3440x1440",
    mem: "8",
    cores: "8",
  });

  expect(sig).toBe("bGFuZz1lbi1VUyUyQ2VuJnR6PUFtZXJpY2ElMkZUb3JvbnRvJnNjcj0zNDQweDE0NDAmbWVtPTgmY29yZXM9OA");
  expect(sig).toMatch(/^[A-Za-z0-9_-]+$/);
});

it("collects every signal the blob accepts, in a stable order", () => {
  stubDevice(fullDevice);

  const signals = collectSignals();
  expect(signals).toEqual({
    lang: "en-US,en",
    tz: "America/Toronto",
    scr: "3440x1440",
    mem: "8",
    cores: "8",
  });
  expect(Object.keys(signals)).toEqual(["lang", "tz", "scr", "mem", "cores"]);
});

// An absent key means "not collected", so an unreadable signal is omitted rather
// than sent empty, and it must not cost us the others.
it("omits signals that are unavailable, out of range, or throw", () => {
  stubDevice({ ...fullDevice, deviceMemory: undefined, cores: 2048 });
  jest.spyOn(Intl, "DateTimeFormat").mockImplementation(() => {
    throw new Error("blocked");
  });

  const signals = collectSignals();
  expect(signals).toEqual({ lang: "en-US,en", scr: "3440x1440" });
});

it("returns an empty blob when no signal is available", () => {
  stubDevice({});

  expect(deviceSignals()).toBe("");
});
