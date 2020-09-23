import SDK from "../lib/sdk";
import Commands from "./commands";

declare global {
  interface Window {
    optableSDK: SDK["constructor"];
    optableCommands: Commands | Function[];
  }
}

//
// Set up window.optableSDK with the SDK factory
//
window.optableSDK = SDK;

//
// Set up window.optableCommands and run any pending commands, if any:
//
var cmds: Commands | Function[] = window.optableCommands || [];
window.optableCommands = new Commands(cmds);
