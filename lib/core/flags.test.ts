import { getFlags, resetFlags } from "./flags";

beforeEach(() => {
  sessionStorage.clear();
  resetFlags();
  Object.defineProperty(window, "location", {
    value: { search: "" },
    writable: true,
    configurable: true,
  });
});

describe("getFlags - URL params", () => {
  it("reads a flag from the URL query string", () => {
    window.location = { search: "?optableDebug=1" } as Location;
    resetFlags();
    expect(getFlags().optableDebug).toBe("1");
  });

  it("uses '1' when a flag is present in the URL with no value", () => {
    window.location = { search: "?optableDebug" } as Location;
    resetFlags();
    expect(getFlags().optableDebug).toBe("1");
  });

  it("reads optableControlGroup from the URL", () => {
    window.location = { search: "?optableControlGroup=1" } as Location;
    resetFlags();
    expect(getFlags().optableControlGroup).toBe("1");
  });

  it("reads multiple flags from the URL", () => {
    window.location = { search: "?optableDebug=1&optableForceTargeting=1" } as Location;
    resetFlags();
    const flags = getFlags();
    expect(flags.optableDebug).toBe("1");
    expect(flags.optableForceTargeting).toBe("1");
  });

  it("ignores unknown URL params", () => {
    window.location = { search: "?somethingElse=1" } as Location;
    resetFlags();
    expect(getFlags()).toEqual({});
  });
});

describe("getFlags - sessionStorage fallback", () => {
  it("reads a flag from sessionStorage when not in the URL", () => {
    sessionStorage.setItem("optableControlGroup", "1");
    expect(getFlags().optableControlGroup).toBe("1");
  });

  it("URL takes precedence over sessionStorage", () => {
    sessionStorage.setItem("optableDebug", "0");
    window.location = { search: "?optableDebug=1" } as Location;
    resetFlags();
    expect(getFlags().optableDebug).toBe("1");
  });
});

describe("getFlags - singleton", () => {
  it("returns the same object on repeated calls", () => {
    expect(getFlags()).toBe(getFlags());
  });

  it("re-parses after resetFlags", () => {
    const first = getFlags();
    resetFlags();
    sessionStorage.setItem("optableDebug", "1");
    const second = getFlags();
    expect(first).not.toBe(second);
    expect(second.optableDebug).toBe("1");
  });
});
