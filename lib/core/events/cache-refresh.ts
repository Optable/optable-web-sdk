import { ResolvedConfig } from "../../config";
import { TargetingResponse } from "../../edge/targeting";

const targetingEventName = "optable-targeting:change";

function sendTargetingUpdateEvent(config: ResolvedConfig, response: TargetingResponse) {
  // Unlabelled EIDs carry no matcher, and a cache-sourced response can be all
  // of them; dropping them keeps the set from reporting a bare undefined.
  const matchers = (response.ortb2?.user?.eids ?? []).map((x) => x.matcher).filter((m) => m !== undefined);

  window.dispatchEvent(
    new CustomEvent(targetingEventName, {
      detail: {
        instance: config.node || config.host,
        resolved: !!response.ortb2?.user?.eids?.length,
        resolvedIDs: response.resolved_ids ?? [],
        abTestID: response.ab_test_id ?? undefined,
        ortb2: response.ortb2,
        provenance: new Set(matchers),
      },
    })
  );
}

export { sendTargetingUpdateEvent, targetingEventName };
