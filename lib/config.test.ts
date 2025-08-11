import { DCN_DEFAULTS, getConfig } from "./config";

const defaultConsent = DCN_DEFAULTS.consent;

describe("getConfig", () => {
  it("returns the default config when no overrides are provided", () => {
    expect(getConfig({ host: "host", site: "site", sessionID: "" })).toEqual({
      host: "host",
      site: "site",
      cookies: true,
      initPassport: true,
      consent: defaultConsent,
      readOnly: false,
      experiments: [],
      sessionID: "",
      skipEnrichment: undefined,
      optableCacheTargeting: "optable-cache:targeting",
    });
  });

  it("allows overriding all properties", () => {
    expect(
      getConfig({
        host: "host",
        site: "site",
        cookies: false,
        initPassport: false,
        consent: { static: defaultConsent },
        readOnly: true,
        node: "my-node",
        legacyHostCache: "legacy-cache",
        experiments: ["tokenize-v2"],
        sessionID: "my-session-id",
        skipEnrichment: true,
        optableCacheTargeting: "my-public-key",
      })
    ).toEqual({
      host: "host",
      site: "site",
      cookies: false,
      initPassport: false,
      consent: defaultConsent,
      readOnly: true,
      node: "my-node",
      legacyHostCache: "legacy-cache",
      experiments: ["tokenize-v2"],
      sessionID: "my-session-id",
      skipEnrichment: true,
      optableCacheTargeting: "my-public-key",
    });
  });

  it("infers regulation and gathers consent when using cmpapi", () => {
    const spy = jest.spyOn(Intl, "DateTimeFormat").mockImplementation(() => ({
      resolvedOptions: () => ({
        timeZone: "America/New_York",
      }),
    }));

    const config = getConfig({
      host: "host",
      site: "site",
      consent: { cmpapi: {} },
    });
    expect(config.consent).toEqual({
      ...defaultConsent,
      reg: "us",
    });

    spy.mockRestore();
  });

  describe("additionalTargetingSignals", () => {
    it("includes additionalTargetingSignals when provided", () => {
      const config = getConfig({
        host: "host",
        site: "site",
        sessionID: "",
        additionalTargetingSignals: {
          url: true,
        },
      });

      expect(config.additionalTargetingSignals).toEqual({
        url: true,
      });
    });

    it("includes additionalTargetingSignals with url set to false", () => {
      const config = getConfig({
        host: "host",
        site: "site",
        sessionID: "",
        additionalTargetingSignals: {
          url: false,
        },
      });

      expect(config.additionalTargetingSignals).toEqual({
        url: false,
      });
    });

    it("includes additionalTargetingSignals with undefined url", () => {
      const config = getConfig({
        host: "host",
        site: "site",
        sessionID: "",
        additionalTargetingSignals: {
          url: undefined,
        },
      });

      expect(config.additionalTargetingSignals).toEqual({
        url: undefined,
      });
    });

    it("does not include additionalTargetingSignals when not provided", () => {
      const config = getConfig({
        host: "host",
        site: "site",
        sessionID: "",
      });

      expect(config.additionalTargetingSignals).toBeUndefined();
    });

    it("preserves additionalTargetingSignals when other properties are overridden", () => {
      const config = getConfig({
        host: "host",
        site: "site",
        sessionID: "",
        cookies: false,
        initPassport: false,
        readOnly: true,
        additionalTargetingSignals: {
          url: true,
        },
      });

      expect(config.additionalTargetingSignals).toEqual({
        url: true,
      });
      expect(config.cookies).toBe(false);
      expect(config.initPassport).toBe(false);
      expect(config.readOnly).toBe(true);
    });
  });
});
