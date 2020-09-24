import SDK from "../lib/sdk";
import Commands from "./commands";

type OptableGlobal = {
  cmd: Commands | Function[];
  SDK: SDK["constructor"];
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
window.optable.SDK = SDK;
window.optable.cmd = new Commands(window.optable.cmd || []);
