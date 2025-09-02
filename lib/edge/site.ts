import type { ResolvedConfig } from "../config";
import { fetch } from "../core/network";
import { LocalStorage } from "../core/storage";

type Size = {
  width: string;
  height: string;
};

type AuctionConfig = {
  seller: string;
  decisionLogicURL: string;
  requestedSize?: Size;
  interestGroupBuyers: string[];
  resolveToConfig?: boolean;
  auctionSignals?: any;
};

type SiteResponse = {};

// Grab the site configuration from the server and store it in local storage
async function Site(config: ResolvedConfig): Promise<SiteResponse> {
  const response: SiteResponse = await fetch("/config", config, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  const ls = new LocalStorage(config);
  ls.setSite(response);
  return response;
}

// Obtain the site configuration from local storage
function SiteFromCache(config: ResolvedConfig): SiteResponse | null {
  const ls = new LocalStorage(config);
  return ls.getSite();
}

export { Site, SiteFromCache };
export default Site;
export type { SiteResponse, Size, AuctionConfig };
