import type { ResolvedConfig } from "../config";
import { fetch } from "../core/network";
import { User } from "./rtb2";

type TokenizeResponse = {
  User: User;
};

type TokenizeRequest = {
  id: string;
};

function Tokenize(config: ResolvedConfig, id: string): Promise<TokenizeResponse> {
  let endpoint = "/v1/tokenize";
  if (config.experiments.includes("tokenize-v2")) {
    endpoint = "/v2/tokenize";
  }

  let request: TokenizeRequest = {
    id: id,
  };
  return fetch(endpoint, config, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });
}

export { Tokenize };
export default Tokenize;
export type { TokenizeRequest, TokenizeResponse };
