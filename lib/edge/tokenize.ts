import type { ResolvedConfig } from "../config";
import type { User } from "iab-openrtb/v26";
import { fetch } from "../core/network";

type TokenizeResponse = {
  user: User;
};

type TokenizeRequest = {
  id: string;
};

function Tokenize(config: ResolvedConfig, id: string): Promise<TokenizeResponse> {
  const endpoint = "/v2/tokenize";

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
