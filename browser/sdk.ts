import Commands from "./commands";
import { resolveMultiNodeTargeting } from "../lib/core/resolvers/resolveMultiTargeting";

import OptableSDK, { InitConfig } from "../lib/sdk";
import "../lib/addons/gpt";
import "../lib/addons/try-identify";

type OptableGlobal = {
  cmd: Commands | Function[];
  SDK: OptableSDK["constructor"];
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
window.optable.cmd = new Commands(window.optable.cmd || []);
window.optable.utils = { resolveMultiNodeTargeting };

if (window.optable.instance_config) {
  window.optable.instance = new OptableSDK(window.optable.instance_config);
}
