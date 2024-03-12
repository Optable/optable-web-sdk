import type { OptableConfig } from "../config";
import { fetch } from "../core/network";
import { LocalStorage } from "../core/storage";

type Size = {
  width: string;
  height: string;
}


type AuctionConfig = {
  seller: string;
  decisionLogicURL: string;
  requestedSize?: Size;
  interestGroupBuyers: string[];
  resolveToConfig?: boolean;
  auctionSignals?: any;
}


type SiteResponse = {
  interestGroupPixel: string;
  auctionConfig?: AuctionConfig | null;
  getTopicsURL: string;
};

// Grab the site configuration from the server and store it in local storage
async function Site(config: Required<OptableConfig>): Promise<SiteResponse> {
  const response: SiteResponse = await fetch("/config", config, {
    method: "GET",
    headers: { "Accept": "application/json" },
  });

  const ls = new LocalStorage(config);
  ls.setSite(response);
  return response;
}

// Obtain the site configuration from local storage
function SiteFromCache(config: Required<OptableConfig>): SiteResponse | null {
  const ls = new LocalStorage(config);
  return ls.getSite();
}

export { Site, SiteResponse, SiteFromCache, Size, AuctionConfig };
export default Site;
