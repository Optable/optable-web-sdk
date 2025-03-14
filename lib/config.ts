import { getConsent, inferRegulation } from "./core/regs/consent";
import type { CMPApiConfig, Consent } from "./core/regs/consent";

type InitConsent = {
  // A "cmpapi" configuration indicating that consent should be gathered from CMP apis.
  cmpapi?: CMPApiConfig;
  // A "static" consent object already collected by the publisher
  static?: Consent;
};

type InitConfig = {
  // Source slug for SDK calls
  site: string;
  // API host
  host: string;
  // Node for API calls (only set if required by the host)
  node?: string;
  // Enable cookie storage
  cookies?: boolean;
  // Previous Host, used only when switching hosts to retain previous cache state
  legacyHostCache?: string;
  // Initialize passport on SDK load
  initPassport?: boolean;
  // Consent settings
  consent?: InitConsent;
  // Enable read-only mode
  readOnly?: boolean;
};

type ResolvedConfig = {
  site: string;
  host: string;
  consent: Consent;
  node?: string;
  cookies?: boolean;
  initPassport?: boolean;
  readOnly?: boolean;
  legacyHostCache?: string;
};

const DCN_DEFAULTS = {
  cookies: true,
  initPassport: true,
  readOnly: false,
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
    cookies: init.cookies ?? DCN_DEFAULTS.cookies,
    initPassport: init.initPassport ?? DCN_DEFAULTS.initPassport,
    consent: DCN_DEFAULTS.consent,
    readOnly: init.readOnly ?? DCN_DEFAULTS.readOnly,
    node: init.node,
    legacyHostCache: init.legacyHostCache,
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
