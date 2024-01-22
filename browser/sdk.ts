import Commands from "./commands";

import OptableSDK from "../lib/sdk";
import "../lib/addons/gpt";
import "../lib/addons/try-identify";
import "../lib/addons/paapi";

type OptableGlobal = {
  cmd: Commands | Function[];
  SDK: OptableSDK["constructor"];
};

declare global {
  interface Window {
    optable?: Partial<OptableGlobal>;
  }
}

declare global {
    interface Document {
        browsingTopics?: () => Promise<any[]>;
    }
}

//
// Set up optable global on window
//
window.optable = window.optable || {};
window.optable.SDK = OptableSDK;
window.optable.cmd = new Commands(window.optable.cmd || []);
