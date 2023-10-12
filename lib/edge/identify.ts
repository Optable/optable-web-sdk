import type { OptableConfig } from "../config";
import { fetch } from "../core/network";

function Identify(config: Required<OptableConfig>, ids: string[]): Promise<void> {
  return fetch("/identify", config, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(ids),
  });
}

export { Identify };
export default Identify;
