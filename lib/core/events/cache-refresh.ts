import { ResolvedConfig } from "../../config";
import { TargetingResponse } from "../../edge/targeting";

const targetingEventName = "optable-targeting:change";

function sendTargetingUpdateEvent(config: ResolvedConfig, response: TargetingResponse) {
  const matchers = response.ortb2?.user?.eids?.map((x) => x.matcher);

  const eventDetail = {
    instance: config.node || config.host,
    resolved: !!response.ortb2?.user?.eids?.length,
    resolvedIDs: response.resolved_ids ?? [],
    abTestID: response.ab_test_id ?? undefined,
    ortb2: response.ortb2,
    provenance: new Set(matchers),
  };

  window.dispatchEvent(new CustomEvent(targetingEventName, { detail: eventDetail }));

  if (config.eidCache?.enabled) {
    window.dispatchEvent(new CustomEvent("optableResolved", { detail: eventDetail }));
    document.dispatchEvent(new CustomEvent("optableResolved", { detail: eventDetail }));
  }
}

export { sendTargetingUpdateEvent };
