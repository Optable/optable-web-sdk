import { getConsent, inferRegulation } from "./core/regs/consent";
import type { CMPApiConfig, Consent } from "./core/regs/consent";

type InitConsent = {
  // A "cmpapi" configuration indicating that consent should be gathered from CMP apis.
  cmpapi?: CMPApiConfig;
  // A "static" consent object already collected by the publisher
  static?: Consent;
};

type InitConfig = {
  host: string;
  site: string;
  cookies?: boolean;
  initPassport?: boolean;
  identityHeaderName?: string;
  consent?: InitConsent;
};

type ResolvedConfig = Required<Omit<InitConfig, "consent">> & {
  consent: Consent;
};

const DCN_DEFAULTS = {
  cookies: true,
  initPassport: true,
  identityHeaderName: "X-Optable-Visitor",
  consent: {
    reg: null,
    deviceAccess: true,
    createProfilesForAdvertising: true,
    useProfilesForAdvertising: true,
    measureAdvertisingPerformance: true,
  },
};

function getConfig(init: InitConfig): ResolvedConfig {
  const config: ResolvedConfig = {
    host: init.host,
    site: init.site,
    identityHeaderName: init.identityHeaderName ?? DCN_DEFAULTS.identityHeaderName,
    cookies: init.cookies ?? DCN_DEFAULTS.cookies,
    initPassport: init.initPassport ?? DCN_DEFAULTS.initPassport,
    consent: DCN_DEFAULTS.consent,
  };

  if (init.consent?.static) {
    config.consent = init.consent.static;
  } else if (init.consent?.cmpapi) {
    config.consent = getConsent(inferRegulation(), init.consent.cmpapi);
  }

  return config;
}

export type { InitConsent, CMPApiConfig, InitConfig, ResolvedConfig };
export { getConfig, DCN_DEFAULTS };
