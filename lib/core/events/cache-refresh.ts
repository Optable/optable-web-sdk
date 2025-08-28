import { ResolvedConfig } from "../../config";
import { TargetingResponse } from "../../edge/targeting";

const targetingEventName = "optable-targeting:change";

function sendTargetingUpdateEvent(config: ResolvedConfig, response: TargetingResponse) {
  const matchers = response.ortb2?.user?.eids?.map((x) => x.matcher);

  window.dispatchEvent(
    new CustomEvent(targetingEventName, {
      detail: {
        instance: config.node || config.host,
        resolved: !!response.ortb2?.user?.eids?.length,
        resolvedIDs: response.resolved_ids ?? [],
        abTestID: response.ab_test_label ?? undefined,
        ortb2: response.ortb2,
        provenance: new Set(matchers),
      },
    })
  );
}

export { sendTargetingUpdateEvent };
