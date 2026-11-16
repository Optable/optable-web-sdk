// Who is behind a bid: advertiser domains, deal and buyer identifiers that Prebid
// bid adapters put on each bid response. Used by both analytics versions so uplift
// changes can be traced to a buyer, a deal or a DSP instead of only a bidder code.

const MAX_DOMAINS = 3;
const MAX_LEN = 64;

export type BidMeta = {
  adomain?: string[];
  dealId?: string;
  networkId?: string;
  networkName?: string;
  buyerId?: string;
  advertiserId?: string;
};

function text(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "string" && typeof value !== "number") return undefined;
  const s = String(value).trim();
  return s ? s.slice(0, MAX_LEN) : undefined;
}

function domains(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const out: string[] = [];
  for (const d of value) {
    const s = text(d)?.toLowerCase();
    if (s && !out.includes(s)) out.push(s);
    if (out.length >= MAX_DOMAINS) break;
  }
  return out.length ? out : undefined;
}

/**
 * Read the buyer-side fields of a Prebid bid response.
 * Fields that are missing or empty are left out, so a bid without them adds nothing to the payload.
 */
export function getBidMeta(bid: any): BidMeta {
  const meta = bid?.meta ?? {};
  const out: BidMeta = {};
  const adomain = domains(meta.advertiserDomains);
  if (adomain) out.adomain = adomain;
  const dealId = text(bid?.dealId);
  if (dealId) out.dealId = dealId;
  const networkId = text(meta.networkId);
  if (networkId) out.networkId = networkId;
  const networkName = text(meta.networkName);
  if (networkName) out.networkName = networkName;
  const buyerId = text(meta.buyerId);
  if (buyerId) out.buyerId = buyerId;
  const advertiserId = text(meta.advertiserId);
  if (advertiserId) out.advertiserId = advertiserId;
  return out;
}
