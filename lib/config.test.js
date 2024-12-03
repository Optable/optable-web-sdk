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
        consent: { deviceAccess: true, reg: "us" },
      })
    ).toEqual({
      host: "host",
      site: "site",
      cookies: false,
      initPassport: false,
      consent: { deviceAccess: true, reg: "us" },
    });
  });

  it("resolves to globalConsent when using auto", () => {
    const config = getConfig({
      host: "host",
      site: "site",
      consent: "auto",
    });
    expect(config.consent).toEqual(globalConsent);
  });
});
