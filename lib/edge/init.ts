import type { OptableConfig } from "../config";
import { fetch } from "../core/network";

function Init(config: OptableConfig): Promise<void> {
  return fetch("/init", config, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export { Init };
export default Init;
