import { getConsent, inferRegulation } from "./core/regs/consent";
import type { CMPApiConfig, Consent } from "./core/regs/consent";

type Experiment = "tokenize-v2";

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
  // Active experiments to test new features
  experiments?: Experiment[];
  // Mock IP address for testing
  mockedIP?: string;
  // Session ID to use, defaults to a random value
  sessionID?: string;
  // Skip Enrichment
  skipEnrichment?: boolean;
  // Targeting call on load
  initTargeting?: boolean;
  // (Defaults to 'optable_cache_targeting') Cache Key used to store 'targeting' response
  optableCacheTargeting?: string;
};

type ResolvedConfig = {
  site: string;
  host: string;
  consent: Consent;
  optableCacheTargeting: string;
  node?: string;
  cookies: boolean;
  initPassport: boolean;
  readOnly: boolean;
  legacyHostCache?: string;
  experiments: Experiment[];
  mockedIP?: string;
  sessionID: string;
  skipEnrichment?: boolean;
  initTargeting?: boolean;
};

const DCN_DEFAULTS = {
  cookies: true,
  initPassport: true,
  readOnly: false,
  experiments: [],
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
    optableCacheTargeting: init.optableCacheTargeting ?? "optable-cache:targeting",
    cookies: init.cookies ?? DCN_DEFAULTS.cookies,
    initPassport: init.initPassport ?? DCN_DEFAULTS.initPassport,
    consent: DCN_DEFAULTS.consent,
    readOnly: init.readOnly ?? DCN_DEFAULTS.readOnly,
    node: init.node,
    legacyHostCache: init.legacyHostCache,
    experiments: init.experiments ?? DCN_DEFAULTS.experiments,
    mockedIP: init.mockedIP,
    sessionID: init.sessionID ?? generateSessionID(),
    skipEnrichment: init.skipEnrichment,
    initTargeting: init.initTargeting,
  };

  if (init.consent?.static) {
    config.consent = init.consent.static;
  } else if (init.consent?.cmpapi) {
    config.consent = getConsent(inferRegulation(), init.consent.cmpapi);
  }

  return config;
}

function generateSessionID(): string {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);

  // Equivalent to esnext arr.toBase64({ omitPadding: true, alphabet: "base64url" })
  return btoa(String.fromCharCode(...arr))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export type { InitConsent, CMPApiConfig, InitConfig, ResolvedConfig };
export { getConfig, DCN_DEFAULTS, generateSessionID };
