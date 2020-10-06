import type { OptableConfig } from "../config";
import { fetch } from "../core/network";

type TargetingKeyValues = {
  [key: string]: string[];
};

function Targeting(config: OptableConfig): Promise<TargetingKeyValues> {
  return fetch("/targeting", config, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export { Targeting, TargetingKeyValues };
export default Targeting;
