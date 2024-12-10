import globalConsent, { Consent } from "./core/regs/consent";

type InitConfig = {
  host: string;
  site: string;
  cookies?: boolean;
  initPassport?: boolean;
  consent?: Consent;
};

type ResolvedConfig = Required<InitConfig>;

const DCN_DEFAULTS = {
  cookies: true,
  initPassport: true,
  consent: globalConsent,
};

function getConfig(init: InitConfig): ResolvedConfig {
  return {
    ...DCN_DEFAULTS,
    ...init,
  };
}

export { InitConfig, ResolvedConfig, getConfig };
