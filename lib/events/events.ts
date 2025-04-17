import { ResolvedConfig } from "../config"
import { TargetingResponse } from "../edge/targeting"

const cacheRefreshEventName = "optable_cache_refresh";

async function sendTargetingCacheRefreshEvent(config: ResolvedConfig, response: TargetingResponse) {
    const matchers = response.ortb2?.user?.eids?.map((x) => x.matcher);

    document.dispatchEvent(new CustomEvent(cacheRefreshEventName, {
        detail: {
            instance: config.node ?? config.host,
            resolved: !!response.ortb2?.user?.eids?.length,
            ortb2: response.ortb2,
            provenance: new Set(matchers)
        },
    }));
}

export { sendTargetingCacheRefreshEvent };
