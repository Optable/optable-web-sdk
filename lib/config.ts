import { Consent } from "./core/regs/consent";

type OptableConfig = {
  host: string;
  site: string;
  cookies?: boolean;
  initPassport?: boolean;
  consent: Consent | "auto";
};

const DCN_DEFAULTS = {
  cookies: true,
  initPassport: true,
  consent: "auto",
};

function getConfig(config: OptableConfig): Required<OptableConfig> {
  return { ...DCN_DEFAULTS, ...config };
}

export { OptableConfig, getConfig };
export default OptableConfig;
