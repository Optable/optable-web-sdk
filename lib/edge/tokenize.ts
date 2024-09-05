import type { OptableConfig } from "../config";
import { fetch } from "../core/network";
import { User } from "./rtb2";


type TokenizeResponse = {
    User: User;
};

type TokenizeRequest = {
    id: string;
};

function Tokenize(config: Required<OptableConfig>, id: string): Promise<TokenizeResponse> {
    let request: TokenizeRequest = {
        id: id,
    };
  return fetch("/v1/tokenize", config, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });
}

export { Tokenize, TokenizeRequest, TokenizeResponse };
export default Tokenize;
