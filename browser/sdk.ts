import Commands from "./commands";

import OptableSDK from "../lib/sdk";
import PrivacySandboxSDK from "../lib/addons/pssdk";
import "../lib/addons/gpt";
import "../lib/addons/try-identify";
import "../lib/addons/paapi";
import "../lib/addons/topics-api";

type OptableGlobal = {
  cmd: Commands | Function[];
  SDK: OptableSDK["constructor"];
  PSSDK: PrivacySandboxSDK["constructor"];
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
