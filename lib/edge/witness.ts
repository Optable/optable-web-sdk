import type { ResolvedConfig } from "../config";
import type { ContextData } from "../core/context";
import { fetch } from "../core/network";

type WitnessProperties = {
  [key: string]: string | number | boolean | unknown[] | null | { [key: string]: unknown };
};

type WitnessPayload = {
  event: string;
  properties: WitnessProperties;
  pageContext?: ContextData;
};

function Witness(
  config: ResolvedConfig,
  event: string,
  properties: WitnessProperties,
  context?: ContextData
): Promise<void> {
  const evt: WitnessPayload = {
    event: event,
    properties: properties,
  };

  if (context) {
    evt.pageContext = context;
  }

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
