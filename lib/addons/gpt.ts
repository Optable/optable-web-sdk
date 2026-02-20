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
    advertiser_id: event.advertiserId?.toString() as string,
    campaign_id: event.campaignId?.toString() as string,
    creative_id: event.creativeId?.toString() as string,
    is_empty: event.isEmpty?.toString() as string,
    line_item_id: event.lineItemId?.toString() as string,
    service_name: event.serviceName?.toString() as string,
    size: event.size?.toString() as string,
    slot_element_id: event.slot?.getSlotElementId() as string,
    source_agnostic_creative_id: event.sourceAgnosticCreativeId?.toString() as string,
    source_agnostic_line_item_id: event.sourceAgnosticLineItemId?.toString() as string,
  };
}

/*
 * installGPTEventListeners() sets up event listeners on the Google Publisher Tag
 * "slotRenderEnded" and "impressionViewable" page events, and calls witness()
 * on the OptableSDK instance to send log data to a DCN.
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

          if (Object.keys(propsToSend).length > 0) {
            sdk.witness("gpt_events_" + snakeCase(eventName), propsToSend);
          }
        });
      }
    } catch (e) {
      // fail silently to avoid breaking host page
    }
  });
};

/*
 * Pass user-defined signals to GAM Secure Signals
 */
OptableSDK.prototype.installGPTSecureSignals = function (...signals: Array<{ provider: string; id: string }>) {
  window.googletag = window.googletag || { cmd: [] };
  const gpt = window.googletag;

  if (signals && signals.length > 0) {
    gpt.cmd.push(() => {
      signals.forEach(({ provider, id }) => {
        gpt.secureSignalProviders.push({
          id: provider,
          collectorFunction: () => Promise.resolve(id),
        });
      });
    });
  }
};
