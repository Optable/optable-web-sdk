import type { SandboxConfig } from "../lib/config";
import SDK from "../lib/sdk";
import Commands from "./commands";

// Macro replaced by webpack at build time
declare const OPTABLE_SANDBOX: SandboxConfig;

declare global {
  interface Window {
    optable: SDK;
    optableCommands: Commands | Function[];
    OPTABLE_SANDBOX: SandboxConfig; // allow global var setup at runtime
  }
}

//
// Load sandbox configuration which tells us the edge to communicate with:
//
const config = OPTABLE_SANDBOX;

//
// Set up the SDK API in window.optable:
//
window.optable = new SDK({ ...config, ...window.OPTABLE_SANDBOX });

//
// Set up window.optableCommands and run any pending commands, if any:
//
var cmds: Commands | Function[] = window.optableCommands || [];
window.optableCommands = new Commands(cmds);
