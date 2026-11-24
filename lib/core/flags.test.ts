import { flagEnabled, getFlags, persistFlagsFromURL, resetFlags } from "./flags";

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

describe("getFlags - URL flag persistence", () => {
  it("persists a URL flag to sessionStorage", () => {
    window.location = { search: "?optableDebug=1" } as Location;
    resetFlags();
    getFlags();
    expect(sessionStorage.getItem("optableDebug")).toBe("1");
  });

  it("a persisted flag still applies after navigating away from the query string", () => {
    window.location = { search: "?optableForceGlobalRouting" } as Location;
    resetFlags();
    getFlags();

    // Next page load in the same session, without the query param.
    window.location = { search: "" } as Location;
    resetFlags();
    expect(getFlags().optableForceGlobalRouting).toBe("1");
  });

  it("persists an explicit 0 so a two-state flag keeps its value", () => {
    window.location = { search: "?optableControlGroup=0" } as Location;
    resetFlags();
    getFlags();

    window.location = { search: "" } as Location;
    resetFlags();
    expect(getFlags().optableControlGroup).toBe("0");
  });

  it("does not write flags that were only read back from sessionStorage", () => {
    sessionStorage.setItem("optableDebug", "1");
    (sessionStorage.setItem as jest.Mock).mockClear();
    getFlags();
    expect(sessionStorage.setItem).not.toHaveBeenCalled();
  });
});

describe("flagEnabled", () => {
  it("is true for a bare flag", () => {
    window.location = { search: "?optableDebug" } as Location;
    resetFlags();
    expect(flagEnabled("optableDebug")).toBe(true);
  });

  it("is true for an explicit 1", () => {
    window.location = { search: "?optableDebug=1" } as Location;
    resetFlags();
    expect(flagEnabled("optableDebug")).toBe(true);
  });

  it("is false for an explicit 0", () => {
    window.location = { search: "?optableDebug=0" } as Location;
    resetFlags();
    expect(flagEnabled("optableDebug")).toBe(false);
  });

  it("is false when the flag is absent", () => {
    expect(flagEnabled("optableDebug")).toBe(false);
  });

  it("is false for an empty value in sessionStorage", () => {
    sessionStorage.setItem("optableDebug", "");
    resetFlags();
    expect(flagEnabled("optableDebug")).toBe(false);
  });

  it("stays false across navigation once persisted as 0", () => {
    window.location = { search: "?optableDebug=0" } as Location;
    resetFlags();
    expect(flagEnabled("optableDebug")).toBe(false);

    window.location = { search: "" } as Location;
    resetFlags();
    expect(flagEnabled("optableDebug")).toBe(false);
  });
});

describe("persistFlagsFromURL", () => {
  it("persists the given keys, with a bare key meaning '1'", () => {
    window.location = { search: "?optableResolveCustom&optableIncludeCustom=abc" } as Location;
    persistFlagsFromURL(["optableResolveCustom", "optableIncludeCustom"]);
    expect(sessionStorage.getItem("optableResolveCustom")).toBe("1");
    expect(sessionStorage.getItem("optableIncludeCustom")).toBe("abc");
  });

  it("returns the values read from the URL", () => {
    window.location = { search: "?optableResolveCustom=abc" } as Location;
    expect(persistFlagsFromURL(["optableResolveCustom", "optableOther"])).toEqual({
      optableResolveCustom: "abc",
    });
  });

  it("leaves keys absent from the URL untouched", () => {
    sessionStorage.setItem("optableResolveCustom", "kept");
    window.location = { search: "" } as Location;
    persistFlagsFromURL(["optableResolveCustom", "optableOther"]);
    expect(sessionStorage.getItem("optableResolveCustom")).toBe("kept");
    expect(sessionStorage.getItem("optableOther")).toBeNull();
  });

  it("does not throw when sessionStorage writes fail", () => {
    window.location = { search: "?optableResolveCustom" } as Location;
    (sessionStorage.setItem as jest.Mock).mockImplementationOnce(() => {
      throw new Error("blocked");
    });
    expect(() => persistFlagsFromURL(["optableResolveCustom"])).not.toThrow();
  });
});

describe("getFlags - newly recognized keys", () => {
  it.each(["optableForceTokenize", "optableResolveId5", "optableResolveID5ID"] as const)(
    "reads %s from the URL",
    (key) => {
      window.location = { search: `?${key}=abc` } as Location;
      resetFlags();
      expect(getFlags()[key]).toBe("abc");
    }
  );
});
