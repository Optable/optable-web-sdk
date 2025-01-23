declare global {
  interface Window {
    __tcfapi?(command: "addEventListener", version: number, cb: AddEventListenerCallback): void;
  }
}

type TCData = {
  tcString: string;
  tcfPolicyVersion: number;
  cmpId: number;
  cmpVersion: number;
  gdprApplies?: boolean;
  eventStatus: "tcloaded" | "cmpuishown" | "useractioncomplete";
  cmpStatus: "stub" | "loading" | "loaded" | "error";
  listenerId?: number;
  isServiceSpecific: boolean;
  useNonStandardStacks: boolean;
  publisherCC: string;
  purposeOneTreatment: boolean;
  purpose?: {
    consents?: {
      [purposeID: string]: boolean;
    };
    legitimateInterests?: {
      [purposeID: string]: boolean;
    };
  };
  vendor?: {
    consents?: {
      [vendorID: string]: boolean;
    };
    legitimateInterests?: {
      [vendorID: string]: boolean;
    };
  };
  specialFeatureOptins: {
    [featureID: string]: boolean;
  };
  publisher?: {
    consents?: {
      [purposeID: string]: boolean;
    };
    legitimateInterests?: {
      [purposeID: string]: boolean;
    };
    customPurpose?: {
      consents?: {
        [purposeID: string]: boolean;
      };
      legitimateInterests?: {
        [purposeID: string]: boolean;
      };
    };
    restrictions?: {
      [purposeID: string]: {
        [vendorID: string]: 0 | 1 | 2;
      };
    };
  };
};

type AddEventListenerCallback = (data: TCData, success: boolean) => void;

// installFrameProxy is a helper function that attempts to install
// a proxy for the CMP API. This is required when the CMP API is installed
// in a parent frame (eg when the SDK is loaded in an iframe).
// See https://github.com/InteractiveAdvertisingBureau/GDPR-Transparency-and-Consent-Framework/blob/master/TCFv2/IAB%20Tech%20Lab%20-%20CMP%20API%20v2.md#using-postmessage
//
// To do so, this function looks for a ancestor frame named __tcfapiLocator and communicates
// with it using postMessage by mocking window.__tcfapi.
function installFrameProxy() {
  // Already there, might be installed by ourselves or a CMP script
  if (typeof window.__tcfapi === "function") {
    return;
  }

  let cmpFrame;
  const cmpCallbacks: Record<string, AddEventListenerCallback> = {};

  let frame = window;
  while (frame) {
    // throws a reference error if no frames exist
    try {
      // @ts-ignore
      if (frame.frames["__tcfapiLocator"]) {
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
  window.__tcfapi = function (command, version, callback) {
    const callId = Math.random() + "";
    cmpCallbacks[callId] = callback;

    cmpFrame.postMessage({ __tcfapiCall: { command, version, callId } }, "*");
  };

  // Receive responses
  window.addEventListener(
    "message",
    (event) => {
      let json: { __tcfapiReturn?: { callId: string; returnValue: TCData; success: boolean } } = {};
      try {
        json = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
      } catch {
        // ignore
      }

      const payload = json.__tcfapiReturn;
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

export type { TCData };
export { installFrameProxy };
