type OptableConfig = {
  host: string;
  site: string;
  insecure?: boolean;
  cookies?: boolean;
  initPassport?: boolean;
  identityHeaderName?: string;
};

const DCN_DEFAULTS = {
  insecure: false,
  cookies: true,
  initPassport: true,
  identityHeaderName: "X-Optable-Visitor",
};

function getConfig(config: OptableConfig): Required<OptableConfig> {
  return { ...DCN_DEFAULTS, ...config };
}

export { OptableConfig, getConfig };
export default OptableConfig;
