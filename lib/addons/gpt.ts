import type { ContextualTargetingKeyValuesOptions } from "../edge/contextual_segments";
import type { WitnessProperties } from "../edge/witness";
import { secureSignalsFromEids } from "../core/secure-signals";
import type { SecureSignal, SecureSignalEid, SecureSignalsFilter } from "../core/secure-signals";
import { debugLog } from "../core/log";
import OptableSDK from "../sdk";

declare module "../sdk" {
  export interface OptableSDK {
    installGPTEventListeners: (eventSpec?: GptEventSpec) => void;
    installGPTSecureSignals: (...signals: SecureSignal[]) => void;
    installGPTSecureSignalsFromEids: (options?: SecureSignalsFromEidsOptions) => void;
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

type SecureSignalsFromEidsOptions = {
  filter?: SecureSignalsFilter;
  // Defaults to the EIDs in the last cached targeting response.
  eids?: SecureSignalEid[];
};

/*
 * Pass user-defined signals to GAM Secure Signals
 */
OptableSDK.prototype.installGPTSecureSignals = function (...signals: SecureSignal[]) {
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

// Installs secure signals built from EIDs, defaulting to the cached targeting
// response. A first visit installs none until targeting() has resolved once.
OptableSDK.prototype.installGPTSecureSignalsFromEids = function (options: SecureSignalsFromEidsOptions = {}) {
  const eids = options.eids ?? this.targetingFromCache()?.ortb2?.user?.eids ?? [];
  this.installGPTSecureSignals(...secureSignalsFromEids(eids, options.filter ?? {}));
};

// Fetches the page's contextual segments and pushes the resulting key-values
// to GAM via googletag.pubads().setTargeting. taxonomyKeys and options are
// forwarded to ctxTargetingKeyValues(); url to ctxSegments(), for SPAs
// classifying a route other than the current location.
//
// Never rejects: callers fire this without awaiting, and page targeting must
// not break ad loading.
export async function setContextualTargetingInGAM(
  sdk: OptableSDK,
  taxonomyKeys?: Record<string, string>,
  options?: ContextualTargetingKeyValuesOptions,
  url?: string
): Promise<void> {
  let kvs: Record<string, string[]>;
  try {
    await sdk.ctxSegments(url);
    kvs = sdk.ctxTargetingKeyValues(taxonomyKeys, options);
  } catch (err) {
    debugLog("warn", "Contextual: segments unavailable", err);
    return;
  }
  if (!Object.keys(kvs).length) return;

  // A partial stub can define googletag without cmd, so build both up rather
  // than only substituting a missing googletag wholesale.
  const gpt = (window.googletag = window.googletag || ({} as typeof window.googletag)) as typeof window.googletag & {
    cmd: Array<() => void>;
  };
  gpt.cmd = gpt.cmd || [];
  gpt.cmd.push(() => {
    const pubads = gpt.pubads && gpt.pubads();
    if (!pubads || typeof pubads.setTargeting !== "function") return;
    for (const [key, values] of Object.entries(kvs)) {
      pubads.setTargeting(key, values);
    }
  });
}

export type { SecureSignalsFromEidsOptions };
