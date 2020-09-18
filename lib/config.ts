type SandboxConfig = {
  host: string;
  site: string;
  insecure?: boolean;
};

const SANDBOX_DEFAULTS = {
  insecure: false,
};

function getConfig(config: SandboxConfig): Required<SandboxConfig> {
  return { ...SANDBOX_DEFAULTS, ...config };
}

export { SandboxConfig, getConfig };
export default SandboxConfig;
