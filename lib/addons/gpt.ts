import type { WitnessProperties } from "../edge/witness";
import { lmpidProvider } from "../edge/targeting";
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
 * InstallGPTSecureSignals() sets up loblaw media private ID secure signals on GPT from targeting.
 * Allow for user-defined signal passing. Currently requires specifying the provider name since most signals will be linked to custom ids.
 */
OptableSDK.prototype.installGPTSecureSignals = function (...signals) {
  const sdk = this;
  const gpt = (window.googletag ||= { cmd: [], secureSignalProviders: [] });

  if (signals?.length) {
    signals.forEach((signal) => {
      const [provider, idString] = signal;
      const id = idString.split(":")[1];
      gpt.cmd.push(function () {
        gpt.secureSignalProviders.push({
          id: providerName,
          collectorFunction: function () {
            return Promise.resolve(id);
          },
        });
      });
    });
  }
};
