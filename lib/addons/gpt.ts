import type { WitnessProperties } from "../edge/witness";
import type { ContextualTargetingKeyValuesOptions } from "../edge/contextual_segments";
import OptableSDK from "../sdk";

/*
 * A GPT custom targeting key-value pair. GPT accepts either a single value or a
 * list of values per key.
 */
type GPTTargetingKeyValues = Record<string, string | string[]>;

/*
 * The subset of an ORTB2 EID this addon reads when deriving secure signals.
 */
type SecureSignalEID = {
  source: string;
  inserter?: string;
  matcher?: string;
  uids?: Array<{ id?: string }>;
};

/*
 * Filters applied to EIDs before they are turned into secure signals. Each
 * filter is an allow-list; an omitted or empty list means "no constraint on
 * this field", matching the matcherFilter convention in the RTD module.
 */
type SecureSignalsFilter = {
  sources?: string[];
  inserters?: string[];
  matchers?: string[];
};

declare module "../sdk" {
  export interface OptableSDK {
    installGPTEventListeners: (eventSpec?: Partial<Record<string, string[] | "all">>) => void;
    installGPTSecureSignals: (...signals: Array<{ provider: string; id: string }>) => void;
    installGPTSecureSignalsFromEIDs: (eids: SecureSignalEID[], filter?: SecureSignalsFilter) => void;
    setGPTTargeting: (keyValues: GPTTargetingKeyValues) => void;
    setGPTContextualTargeting: (
      taxonomyKeys?: Record<string, string>,
      options?: ContextualTargetingKeyValuesOptions
    ) => void;
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

/*
 * Providers already handed to installGPTSecureSignals on this page load. GPT
 * registers one collector per provider id, so pushing the same provider twice
 * would register a duplicate collector. Tracked at module scope because the
 * secureSignalProviders array is a page-level GPT global, not per-SDK-instance.
 */
const registeredSecureSignalProviders = new Set<string>();

/*
 * installGPTSecureSignalsFromEIDs() derives GAM secure signals from a list of
 * ORTB2 EIDs and registers them via installGPTSecureSignals().
 *
 * Each filter in `filter` is an allow-list. An omitted or empty list places no
 * constraint on that field, so passing no filter at all emits every uid of every
 * EID. A provider is registered at most once per page load; later calls with the
 * same provider are ignored, including when the underlying id has since changed.
 */
OptableSDK.prototype.installGPTSecureSignalsFromEIDs = function (
  eids: SecureSignalEID[],
  filter: SecureSignalsFilter = {}
) {
  if (!eids || eids.length === 0) {
    return;
  }

  const { sources, inserters, matchers } = filter;
  const allowed = (list: string[] | undefined, value: string | undefined): boolean =>
    !list || list.length === 0 || list.includes(value || "");

  const signals: Array<{ provider: string; id: string }> = [];

  eids.forEach((eid) => {
    if (!eid || !eid.source) return;
    if (!allowed(sources, eid.source)) return;
    if (!allowed(inserters, eid.inserter)) return;
    if (!allowed(matchers, eid.matcher)) return;
    if (registeredSecureSignalProviders.has(eid.source)) return;

    const uid = (eid.uids || []).find((u) => u && u.id);
    if (!uid || !uid.id) return;

    registeredSecureSignalProviders.add(eid.source);
    signals.push({ provider: eid.source, id: uid.id });
  });

  if (signals.length > 0) {
    this.installGPTSecureSignals(...signals);
  }
};

/*
 * setGPTTargeting() writes page-level custom targeting key-values to GAM.
 *
 * Uses googletag.setConfig(), which merges the supplied keys into the existing
 * page-level targeting rather than replacing it, so it is safe to call alongside
 * a publisher's own targeting and more than once with different keys.
 */
OptableSDK.prototype.setGPTTargeting = function (keyValues: GPTTargetingKeyValues) {
  if (!keyValues || Object.keys(keyValues).length === 0) {
    return;
  }

  window.googletag = window.googletag || { cmd: [] };
  const gpt = window.googletag as any;

  gpt.cmd.push(() => {
    try {
      gpt.setConfig({ targeting: keyValues });
    } catch (e) {
      // fail silently to avoid breaking host page
    }
  });
};

/*
 * setGPTContextualTargeting() pushes the contextual targeting key-values for the
 * current page to GAM via pubads().setTargeting().
 *
 * This reads the contextual response already cached on the SDK instance and does
 * not fetch. Call it from the initContextual callback, or after awaiting
 * ctxSegments(), so the response is present:
 *
 *   new OptableSDK({ ..., initContextual: () => sdk.setGPTContextualTargeting() })
 *
 * taxonomyKeys and options are forwarded to ctxTargetingKeyValues() unchanged.
 */
OptableSDK.prototype.setGPTContextualTargeting = function (
  taxonomyKeys?: Record<string, string>,
  options?: ContextualTargetingKeyValuesOptions
) {
  const keyValues = this.ctxTargetingKeyValues(taxonomyKeys, options);
  if (Object.keys(keyValues).length === 0) {
    return;
  }

  window.googletag = window.googletag || { cmd: [] };
  const gpt = window.googletag;

  gpt.cmd.push(() => {
    try {
      const pubads = gpt.pubads && gpt.pubads();
      if (!pubads || typeof pubads.setTargeting !== "function") return;

      Object.entries(keyValues).forEach(([key, values]) => {
        pubads.setTargeting(key, values);
      });
    } catch (e) {
      // fail silently to avoid breaking host page
    }
  });
};

/*
 * Clears the record of already-registered secure signal providers. Intended for
 * tests, which reuse a single module instance across page-level GPT mocks.
 */
function resetRegisteredSecureSignalProviders(): void {
  registeredSecureSignalProviders.clear();
}

export { resetRegisteredSecureSignalProviders };
export type { GPTTargetingKeyValues, SecureSignalEID, SecureSignalsFilter };
