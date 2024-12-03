import type { ResolvedConfig } from "../config";
import { fetch } from "../core/network";

function Identify(config: ResolvedConfig, ids: string[]): Promise<void> {
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
