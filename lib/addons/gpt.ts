import type { WitnessProperties } from "../edge/witness";
import OptableSDK from "../sdk";

declare module "../sdk" {
  export interface OptableSDK {
    installGPTEventListeners: () => void;
    installGPTSecureSignals: () => void;
  }
}

type CombinedEvents =
  | (googletag.events.SlotRenderEndedEvent & Partial<googletag.events.ImpressionViewableEvent>)
  | (googletag.events.ImpressionViewableEvent & Partial<googletag.events.SlotRenderEndedEvent>);

function toWitnessProperties(event: CombinedEvents): WitnessProperties {
  return {
    advertiserId: event.advertiserId?.toString() as string,
    campaignId: event.campaignId?.toString() as string,
    creativeId: event.creativeId?.toString() as string,
    isEmpty: event.isEmpty?.toString() as string,
    lineItemId: event.lineItemId?.toString() as string,
    serviceName: event.serviceName?.toString(),
    size: event.size?.toString() as string,
    slotElementId: event.slot?.getSlotElementId(),
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
    gpt.pubads().addEventListener("slotRenderEnded", function (event: googletag.events.SlotRenderEndedEvent) {
      sdk.witness("googletag.events.slotRenderEnded", toWitnessProperties(event));
    });
    gpt.pubads().addEventListener("impressionViewable", function (event: googletag.events.ImpressionViewableEvent) {
      sdk.witness("googletag.events.impressionViewable", toWitnessProperties(event));
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
