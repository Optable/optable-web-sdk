import { DCN_DEFAULTS, getConfig } from "./config";

const defaultConsent = DCN_DEFAULTS.consent;

describe("getConfig", () => {
  it("returns the default config when no overrides are provided", () => {
    expect(getConfig({ host: "host", site: "site" })).toEqual({
      host: "host",
      site: "site",
      cookies: true,
      initPassport: true,
      consent: defaultConsent,
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
      })
    ).toEqual({
      host: "host",
      site: "site",
      cookies: false,
      initPassport: false,
      consent: defaultConsent,
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
});
