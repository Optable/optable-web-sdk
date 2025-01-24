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
  consent?: InitConsent;
};

type ResolvedConfig = Required<Omit<InitConfig, "consent">> & {
  consent: Consent;
};

const defaultConsent: Consent = {
  reg: null,
  deviceAccess: true,
  createProfilesForAdvertising: true,
  useProfilesForAdvertising: true,
  measureAdvertisingPerformance: true,
};

function getConfig(init: InitConfig): ResolvedConfig {
  return {
    host: init.host,
    site: init.site,
    cookies: init.cookies ?? true,
    initPassport: init.initPassport ?? true,
    consent: resolveConsent(init.consent),
  };
}

function resolveConsent(init?: InitConsent): Consent {
  if (init?.static) {
    return init.static;
  } else if (init?.cmpapi) {
    return getConsent(inferRegulation(), init.cmpapi);
  }

  return defaultConsent;
}

export type { InitConsent, CMPApiConfig, InitConfig, ResolvedConfig };
export { getConfig, resolveConsent };
