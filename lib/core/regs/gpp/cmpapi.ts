import * as sections from "./sections";

declare global {
  interface Window {
    __gpp?(command: "addEventListener", cb: AddEventListenerCallback): void;
  }
}

type ParsedSections = {
  [sections.tcfcav1.APIPrefix]?: sections.tcfcav1.Section;
  [sections.tcfeuv2.APIPrefix]?: sections.tcfeuv2.Section;
  [sections.usnat.APIPrefix]?: sections.usnat.Section;
  [sections.usca.APIPrefix]?: sections.usca.Section;
  [sections.usco.APIPrefix]?: sections.usco.Section;
  [sections.usct.APIPrefix]?: sections.usct.Section;
  [sections.usde.APIPrefix]?: sections.usde.Section;
  [sections.usfl.APIPrefix]?: sections.usfl.Section;
  [sections.usia.APIPrefix]?: sections.usia.Section;
  [sections.usmt.APIPrefix]?: sections.usmt.Section;
  [sections.usne.APIPrefix]?: sections.usne.Section;
  [sections.usnh.APIPrefix]?: sections.usnh.Section;
  [sections.usnj.APIPrefix]?: sections.usnj.Section;
  [sections.usor.APIPrefix]?: sections.usor.Section;
  [sections.ustn.APIPrefix]?: sections.ustn.Section;
  [sections.ustx.APIPrefix]?: sections.ustx.Section;
  [sections.usut.APIPrefix]?: sections.usut.Section;
  [sections.usva.APIPrefix]?: sections.usva.Section;
};

type PingReturn = {
  gppVersion: string;
  cmpStatus: "stub" | "loading" | "loaded" | "error";
  cmpDisplayStatus: "hidden" | "visible" | "disabled";
  signalStatus: "not ready" | "ready";
  supportedAPIs: string[];
  cmpId: number;
  sectionList: number[];
  applicableSections: number[];
  gppString: string;
  parsedSections?: ParsedSections;
};

type AddEventListener = {
  eventName: string;
  listenerId: number;
  data: any;
  pingData: PingReturn;
};

type AddEventListenerCallback = (data: AddEventListener, success: boolean) => void;

// installFrameProxy is a helper function that attempts to install
// a proxy for the CMP API. This is required when the CMP API is installed
// in a parent frame (eg when the SDK is loaded in an iframe).
// See https://github.com/InteractiveAdvertisingBureau/GDPR-Transparency-and-Consent-Framework/blob/master/TCFv2/IAB%20Tech%20Lab%20-%20CMP%20API%20v2.md#using-postmessage
//
// To do so, this function looks for a ancestor frame named __gppLocator and communicates
// with it using postMessage by mocking window.__gpp.
function installFrameProxy() {
  // Already there, might be installed by ourselves or a CMP script
  if (typeof window.__gpp === "function") {
    return;
  }

  let cmpFrame;
  const cmpCallbacks: Record<string, AddEventListenerCallback> = {};

  let frame = window;
  while (frame) {
    // throws a reference error if no frames exist
    try {
      // @ts-ignore
      if (frame.frames["__gppLocator"]) {
        cmpFrame = frame;
        break;
      }
    } catch {
      // ignore
    }

    if (frame === window.top) {
      break;
    }
    // @ts-ignore
    frame = frame.parent;
  }

  // No CMP frame found
  if (!cmpFrame) {
    return;
  }

  // Install the API that forwards to the CMP frame
  window.__gpp = function (command, callback) {
    const callId = Math.random() + "";
    cmpCallbacks[callId] = callback;

    cmpFrame.postMessage({ __gppCall: { command, version: "1.1", callId } }, "*");
  };

  // Receive responses
  window.addEventListener(
    "message",
    (event) => {
      let json: { __gppReturn?: { callId: string; success: boolean; returnValue: AddEventListener } } = {};
      try {
        json = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
      } catch {
        // ignore
      }

      const payload = json.__gppReturn;
      if (!payload) {
        return;
      }

      if (typeof cmpCallbacks[payload.callId] === "function") {
        // Call the callback
        cmpCallbacks[payload.callId](payload.returnValue, payload.success);
        // Remove the callback
        delete cmpCallbacks[payload.callId];
      }
    },
    false
  );
}

export type { PingReturn };
export { installFrameProxy };
