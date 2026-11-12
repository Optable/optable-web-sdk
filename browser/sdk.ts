import { resolveMultiNodeTargeting } from "../lib/core/resolvers/resolveMultiTargeting";
import { secureSignalsFromEids } from "../lib/core/secure-signals";

import OptableSDK, { InitConfig } from "../lib/sdk";
import OptablePrebidAnalytics from "../lib/addons/prebid/analytics";
import OptableCommands from "../lib/addons/commands";
import "../lib/addons/gpt";
import "../lib/addons/try-identify";

type OptableGlobal = {
  cmd: OptableCommands | Function[];
  SDK: OptableSDK["constructor"];
  OptablePrebidAnalytics: typeof OptablePrebidAnalytics;
  utils: Record<string, Function>;
  instance?: OptableSDK;
  instance_config?: InitConfig;
};

declare global {
  interface Window {
    optable?: Partial<OptableGlobal>;
  }
}

//
// Set up optable global on window
//
window.optable = window.optable || {};
window.optable.SDK = OptableSDK;
window.optable.OptablePrebidAnalytics = OptablePrebidAnalytics;
window.optable.utils = { resolveMultiNodeTargeting, secureSignalsFromEids };

if (window.optable.instance_config) {
  window.optable.instance = new OptableSDK(window.optable.instance_config);
}

// Drain queued commands last so they can use the instance created above
window.optable.cmd = new OptableCommands(window.optable.cmd || []);
