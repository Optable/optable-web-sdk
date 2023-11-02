type OptableConfig = {
  host: string;
  site: string;
  insecure?: boolean;
  cookies?: boolean;
  initPassport?: boolean;
};

const SDK_DEFAULTS = {
  insecure: false,
  cookies: true,
  initPassport: true,
};

function getConfig(config: OptableConfig): Required<OptableConfig> {
  return { ...SDK_DEFAULTS, ...config };
}

export { OptableConfig, getConfig };
export default OptableConfig;
