import type { OptableConfig } from "../config";
import { fetch } from "../core/network";

type WitnessProperties = {
  [key: string]: string | number | boolean;
};

function Witness(config: OptableConfig, event: string, properties: WitnessProperties): Promise<void> {
  const evt = {
    event: event,
    properties: properties,
  };

  return fetch("/witness", config, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(evt),
  });
}

export { Witness, WitnessProperties };
export default Witness;
