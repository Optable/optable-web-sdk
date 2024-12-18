import globalConsent, { Consent } from "./core/regs/consent";

type InitConfig = {
  host: string;
  site: string;
  cookies?: boolean;
  initPassport?: boolean;
  consent?: Consent | "auto";
};

type ResolvedConfig = Required<InitConfig> & {
  consent: Consent;
};

const DCN_DEFAULTS = {
  cookies: true,
  initPassport: true,
  // Backwards compatibility, default to device access allowed
  // Once we have measured the impact of automatic CMP integration in the wild
  // we may move to "auto" default.
  consent: { deviceAccess: true, reg: null } as Consent,
};

function getConfig(init: InitConfig): ResolvedConfig {
  const config = {
    host: init.host,
    site: init.site,
    cookies: init.cookies ?? DCN_DEFAULTS.cookies,
    initPassport: init.initPassport ?? DCN_DEFAULTS.initPassport,
    consent: DCN_DEFAULTS.consent,
  };

  if (init.consent) {
    config.consent = init.consent === "auto" ? globalConsent : init.consent;
  }
  return config;
}

export { InitConfig, ResolvedConfig, getConfig };
