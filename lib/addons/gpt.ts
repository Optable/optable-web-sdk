import type { WitnessProperties } from "../edge/witness";
import OptableSDK from "../sdk";

declare module "../sdk" {
  export interface OptableSDK {
    installGPTEventListeners: () => void;
    installGPTSecureSignals: () => void;
  }
}

function toWitnessProperties(event: any): WitnessProperties {
  return {
    advertiserId: event.advertiserId?.toString() as string,
    campaignId: event.campaignId?.toString() as string,
    creativeId: event.creativeId?.toString() as string,
    isEmpty: event.isEmpty?.toString() as string,
    lineItemId: event.lineItemId?.toString() as string,
    serviceName: event.serviceName?.toString() as string,
    size: event.size?.toString() as string,
    slotElementId: event.slot?.getSlotElementId() as string,
    sourceAgnosticCreativeId: event.sourceAgnosticCreativeId?.toString() as string,
    sourceAgnosticLineItemId: event.sourceAgnosticLineItemId?.toString() as string,
  };
}

/*
 * installGPTEventListeners() sets up event listeners on the Google Publisher Tag
 * "slotRenderEnded" and "impressionViewable" page events, and calls witness()
 * on the OptableSDK instance to send log data to a DCN.
 */
OptableSDK.prototype.installGPTEventListeners = function () {
  // Next time we get called is a no-op:
  const sdk = this;
  sdk.installGPTEventListeners = function () {};

  window.googletag = window.googletag || { cmd: [] };
  const gpt = window.googletag;

  gpt.cmd.push(function () {
    gpt.pubads().addEventListener("slotRenderEnded", function (event: any) {
      sdk.witness("googletag.events.slotRenderEnded", toWitnessProperties(event));
    });
    gpt.pubads().addEventListener("impressionViewable", function (event: any) {
      sdk.witness("googletag.events.impressionViewable", toWitnessProperties(event));
    });
  });
};

/*
 * Pass user-defined signals to GAM Secure Signals
 */
type GptEventSpec = Partial<Record<string, string[] | "all">>;

OptableSDK.prototype.installGPTEventListeners = function (eventSpec?: GptEventSpec) {
  // Next time we get called is a no-op:
  const sdk = this;
  sdk.installGPTEventListeners = function () {};

  window.googletag = window.googletag || { cmd: [] };
  const gpt = (window as any).googletag;

  const DEFAULT_EVENTS = ["slotRenderEnded", "impressionViewable"];

  function snakeCase(name: string) {
    return name.replace(/[A-Z]/g, (m) => "_" + m.toLowerCase());
  }

  function filterProps(obj: any, keys: string[]) {
    if (!obj || !keys || !keys.length) return {};
    const out: any = {};
    for (const k of keys) {
      if (Object.prototype.hasOwnProperty.call(obj, k)) {
        out[k] = obj[k];
      }
    }
    return out;
  }

  gpt.cmd.push(function () {
    try {
      const pubads = gpt.pubads && gpt.pubads();
      if (!pubads || typeof pubads.addEventListener !== "function") return;

      const eventsToRegister = eventSpec ? Object.keys(eventSpec) : DEFAULT_EVENTS;

      for (const eventName of eventsToRegister) {
        const keysOrAll = eventSpec ? eventSpec[eventName] : "all";

        pubads.addEventListener(eventName, function (event: any) {
          const fullProps = toWitnessProperties(event);
          const propsToSend =
            Array.isArray(keysOrAll) && keysOrAll.length ? filterProps(fullProps, keysOrAll) : fullProps;

          sdk.witness("gpt_events_" + snakeCase(eventName), propsToSend);
        });
      }
    } catch (e) {
      // fail silently to avoid breaking host page
    }
  });
};
