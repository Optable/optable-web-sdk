import { getConfig } from "./config";
import globalConsent from "./core/regs/consent";

describe("getConfig", () => {
  it("returns the default config when no overrides are provided", () => {
    expect(getConfig({ host: "host", site: "site" })).toEqual({
      host: "host",
      site: "site",
      cookies: true,
      initPassport: true,
      consent: { deviceAccess: true, reg: null },
    });
  });

  it("allows overriding all properties", () => {
    expect(
      getConfig({
        host: "host",
        site: "site",
        cookies: false,
        initPassport: false,
        consent: { static: { deviceAccess: true, reg: "us" } },
      })
    ).toEqual({
      host: "host",
      site: "site",
      cookies: false,
      initPassport: false,
      consent: { deviceAccess: true, reg: "us" },
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
    expect(config.consent).toEqual({ deviceAccess: true, reg: "us" });

    spy.mockRestore();
  });
});
