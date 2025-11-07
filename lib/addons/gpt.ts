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
OptableSDK.prototype.installGPTEventListeners = function () {
  // Next time we get called is a no-op:
  const sdk = this;
  sdk.installGPTEventListeners = function () {};

  window.googletag = window.googletag || { cmd: [] };
  const gpt = window.googletag;

  gpt.cmd.push(function () {
    gpt.pubads().addEventListener("slotRenderEnded", function (event: any) {
      sdk.witness("gpt_events_slot_render_ended", toWitnessProperties(event));
    });
    gpt.pubads().addEventListener("impressionViewable", function (event: any) {
      sdk.witness("gpt_events_impression_viewable", toWitnessProperties(event));
    });
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
