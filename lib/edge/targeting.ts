import type { OptableConfig } from "../config";
import { fetch } from "../core/network";
import { LocalStorage } from "../core/storage";

type TargetingKeyValues = {
  [key: string]: string[];
};

async function Targeting(config: OptableConfig): Promise<TargetingKeyValues> {
  const response: TargetingKeyValues = await fetch("/targeting", config, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (response) {
    const ls = new LocalStorage(config);
    ls.setTargeting(response);
  }

  return response;
}

function TargetingFromCache(config: OptableConfig): TargetingKeyValues | null {
  const ls = new LocalStorage(config);
  return ls.getTargeting();
}

function TargetingClearCache(config: OptableConfig) {
  const ls = new LocalStorage(config);
  ls.clearTargeting();
}

export { Targeting, TargetingFromCache, TargetingClearCache, TargetingKeyValues };
export default Targeting;
