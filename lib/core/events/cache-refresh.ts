import { ResolvedConfig } from "../../config";
import { TargetingResponse } from "../../edge/targeting";

const targetingEventName = "optable-targeting:change";

function sendTargetingUpdateEvent(config: ResolvedConfig, response: TargetingResponse) {
  // Unlabelled EIDs carry no matcher; dropping them keeps a bare undefined
  // out of the set.
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
