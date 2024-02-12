import type { OptableConfig } from "../config";
import { fetch } from "../core/network";

type SiteResponse = {
  interestGroupPixel: string;
  auctionConfigURL: string;
  getTopicsURL: string;
};

async function Site(config: Required<OptableConfig>): Promise<SiteResponse> {
  return await fetch("/config", config, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
}

export { Site, SiteResponse };
export default Site;
