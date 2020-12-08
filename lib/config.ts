type OptableConfig = {
  host: string;
  site: string;
  insecure?: boolean;
  cookies?: boolean;
};

const SANDBOX_DEFAULTS = {
  insecure: false,
  cookies: true,
};

function getConfig(config: OptableConfig): Required<OptableConfig> {
  return { ...SANDBOX_DEFAULTS, ...config };
}

export { OptableConfig, getConfig };
export default OptableConfig;
