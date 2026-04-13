// browser/pub.ts — Go text/template + TypeScript
// This file is processed by Go text/template BEFORE esbuild compilation.
// It is NOT valid TypeScript until template directives are resolved.
//
// Template variables:
//   .Host              - Edge API hostname (e.g. "ca.edge.optable.co")
//   .Site              - Site slug derived from origin
//   .Node              - Node slug derived from tenant
//   .Timeout           - Optional timeout hint (e.g. "500ms", "2s")
//   .PrebidGlobal      - Prebid.js global variable name (e.g. "pbjs", "__pmc_atlasmg_pbjs")
//   .EnableSecureSignals  - Boolean: enable GPT Secure Signals
//   .EnableBotDetection   - Boolean: enable bot detection
//   .EnableAnalytics      - Boolean: enable Prebid analytics
//   .GeoTargeting         - "regional" or "multi-region"

import OptableSDK from "@optable/web-sdk";
{{if .EnableAnalytics}}
import OptablePrebidAnalytics from "@optable/web-sdk/lib/dist/addons/prebid/analytics";
{{end}}

declare global {
  interface Window {
    optable?: Record<string, any>;
  }
}

// --- Commands queue (executes queued functions immediately) ---
class OptableCommands {
  constructor(cmds: OptableCommands | Function[]) {
    if (Array.isArray(cmds)) {
      for (const cmd of cmds) {
        if (typeof cmd === "function") cmd();
      }
    }
  }
  push(cmd: Function) {
    cmd();
  }
}

// --- Debug logging ---
function optableMessage(...args: unknown[]) {
  if (sessionStorage.optableDebug) {
    console.log("[OPTABLE WRAPPER]", ...args);
  }
}

// --- URL query feature flags ---
function setOptableFlagsFromURLQuery() {
  const keys = ["optableDebug", "optableDisableConsent", "optableResolveTD", "optableEnableAnalytics"];
  const search = window.location.search || "";
  keys.forEach((key) => {
    if (search.match(new RegExp(key, "g"))) {
      sessionStorage.setItem(key, "1");
    }
  });
}

// --- Consent handling ---
function getConsent() {
  if (sessionStorage.optableDisableConsent) {
    return {
      createProfilesForAdvertising: true,
      deviceAccess: true,
      measureAdvertisingPerformance: true,
      reg: null,
      useProfilesForAdvertising: true,
    };
  }
  return { cmpapi: {} };
}

{{if .EnableAnalytics}}
// --- Analytics initialization ---
function initPrebidAnalytics(sdk: OptableSDK) {
  const pbjsObject = (window as any)["{{.PrebidGlobal}}"] || (window as any)["pbjs"];
  if (!pbjsObject) return;

  const analyticsSDK = new OptableSDK({
    host: "{{.Host}}",
    node: "analytics",
    site: "analytics",
    readOnly: true,
    cookies: false,
  });

  const analytics = new OptablePrebidAnalytics(analyticsSDK, {
    analytics: true,
    tenant: "{{.Node}}",
    debug: !!sessionStorage.optableDebug,
    samplingRate: 0.1,
  });

  analytics.hookIntoPrebid(pbjsObject);
}
{{end}}

// --- Main execution ---
(function run() {
  setOptableFlagsFromURLQuery();

  window.optable = window.optable || {};
  window.optable.SDK = OptableSDK;

  const consent = getConsent();
  const sdk = new OptableSDK({
    host: "{{.Host}}",
    site: "{{.Site}}",
    node: "{{.Node}}",
    cookies: false,
    consent,
    initPassport: false,
    {{- if .Timeout}}
    timeout: "{{.Timeout}}",
    {{- end}}
  });

  window.optable["{{.Node}}_instance"] = sdk;

  {{if .EnableSecureSignals}}
  optableMessage("Enabling secure signals");
  sdk.installGPTSecureSignals();
  {{end}}

  {{if .EnableBotDetection}}
  optableMessage("Enabling bot detection");
  (sdk as any).enableBotDetection();
  {{end}}

  {{if eq .GeoTargeting "multi-region"}}
  optableMessage("Multi-region mode: reading window.optable.countryCode");
  (sdk as any).setCountryCodeFromGlobal();
  {{end}}

  {{if .EnableAnalytics}}
  initPrebidAnalytics(sdk);
  {{end}}

  window.optable.cmd = new OptableCommands(window.optable.cmd || []);
  optableMessage("SDK initialized");
})();
