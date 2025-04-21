import { ResolvedConfig } from "../../config";
import { TargetingResponse } from "../../edge/targeting";

const ortb2CacheRefreshEventName = "optable_cache_refresh";

function sendOrtb2CacheRefreshEvent(config: ResolvedConfig, response: TargetingResponse) {
  const matchers = response.ortb2?.user?.eids?.map((x) => x.matcher);

  window.dispatchEvent(
    new CustomEvent(ortb2CacheRefreshEventName, {
      detail: {
        instance: config.node || config.host,
        resolved: !!response.ortb2?.user?.eids?.length,
        ortb2: response.ortb2,
        provenance: new Set(matchers),
      },
    })
  );
}

export { sendOrtb2CacheRefreshEvent };
