import type { OptableConfig } from "../config";
import { fetch } from "../core/network";

type Uid2TokenResponse = {
  advertising_token: string;
  RefreshToken: string;
  IdentityExpires: number;
  RefreshFrom: number;
  RefreshExpires: number;
  RefreshResponseKey: string;
};

function Uid2Token(config: Required<OptableConfig>, id: string): Promise<Uid2TokenResponse> {
  return fetch("/uid2/token", config, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(id),
  });
}

export { Uid2Token };
export default Uid2Token;
