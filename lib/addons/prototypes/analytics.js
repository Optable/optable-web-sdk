/* eslint-disable no-param-reassign */
const STATUS = {
  REQUESTED: "REQUESTED",
  RECEIVED: "RECEIVED",
  NO_BID: "NO_BID",
  TIMEOUT: "TIMEOUT",
};

// Mirrors lib/core/traffic-source.ts. Inlined because this prototype bundle is
// self-contained and pulls in no modules.
const TRAFFIC_SOURCE_KEY = "optableTrafficSource";
const SEARCH_SITES = ["google", "bing", "yahoo", "duckduckgo", "ecosia", "baidu", "yandex", "qwant", "startpage"];
const SOCIAL_SITES = [
  "facebook",
  "fb",
  "instagram",
  "twitter",
  "x",
  "t",
  "linkedin",
  "lnkd",
  "reddit",
  "pinterest",
  "tiktok",
  "threads",
  "snapchat",
  "youtube",
];
const PAID_CLICK_IDS = ["gclid", "gbraid", "wbraid", "fbclid", "msclkid", "ttclid", "twclid", "dclid"];
const PAID_MEDIUMS = ["cpc", "ppc", "paid", "paidsocial", "paid_social", "display", "cpm"];
const TWO_PART_SUFFIXES = ["co.uk", "com.au", "co.jp", "co.in", "com.br", "co.nz", "com.mx", "co.za", "co.kr"];

function siteName(host) {
  const labels = host.toLowerCase().split(".");
  if (labels.length < 2) return labels[0] || "";

  const index = TWO_PART_SUFFIXES.includes(labels.slice(-2).join(".")) ? labels.length - 3 : labels.length - 2;
  return labels[index] || "";
}

function referrerHost() {
  if (!document.referrer) return "";

  try {
    return new URL(document.referrer).hostname;
  } catch {
    return "";
  }
}

function classifyTrafficSource(host) {
  const params = new URLSearchParams(window.location.search);
  const medium = (params.get("utm_medium") || "").toLowerCase();

  if (PAID_CLICK_IDS.some((id) => params.has(id)) || PAID_MEDIUMS.includes(medium)) return "paid";
  if (medium === "email") return "email";
  if (params.has("utm_source")) return "campaign";
  if (!host) return "direct";
  if (host === window.location.hostname) return "internal";

  const site = siteName(host);
  if (SEARCH_SITES.includes(site)) return "organic_search";
  if (SOCIAL_SITES.includes(site)) return "social";

  return "referral";
}

// First-touch per tab: document.referrer becomes our own hostname after the
// first internal click, so the first non-internal result is cached and reused.
// Only the referring hostname is kept, never the full referring URL.
function getTrafficSource() {
  try {
    const cached = window.sessionStorage?.getItem(TRAFFIC_SOURCE_KEY);
    if (cached) return JSON.parse(cached);
  } catch {
    // sessionStorage unavailable or holding malformed JSON, recompute below.
  }

  const referrer = referrerHost();
  const properties = { referrer, trafficSource: classifyTrafficSource(referrer) };

  if (properties.trafficSource !== "internal") {
    try {
      window.sessionStorage?.setItem(TRAFFIC_SOURCE_KEY, JSON.stringify(properties));
    } catch {
      // Storage blocked or full, the value is still returned for this event.
    }
  }

  return properties;
}

class OptablePrebidAnalytics {
  constructor(optableInstance, config = {}) {
    if (!optableInstance || typeof optableInstance.witness !== "function") {
      throw new Error("OptablePrebidAnalytics requires a valid optable instance with witness() method");
    }

    this.config = {
      debug: config.debug ?? optableInstance.config ?? false,
      ...config,
    };

    this.optableInstance = optableInstance;
    this.isInitialized = true;

    // Store auction data
    this.auctions = {};
    this.missedAuctionIds = new Set();
    this.maxAuctionDataSize = 20;

    sessionStorage.optableSessionDepthIndex = (Number(sessionStorage?.optableSessionDepthIndex) || 0) + 1;

    this.log("OptablePrebidAnalytics initialized");
  }

  /**
   * Log messages if debug is enabled
   */
  log(...args) {
    if (this.config.debug) {
      console.log("[OptablePrebidAnalytics]", ...args); /* eslint-disable-line no-console */
    }
  }

  /**
   * Send event to Witness API
   */
  async sendToWitnessAPI(eventName, properties = {}) {
    if (!this.config.analytics) {
      this.log("Witness API calls disabled - would send:", eventName, properties);
      return { disabled: true, eventName, properties };
    }

    try {
      await this.optableInstance.witness(eventName, properties);
      this.log("Sending to Witness API:", eventName, properties);
    } catch (error) {
      this.log("Error sending to Witness API:", eventName, properties, error);
      throw error;
    }
    return { disabled: false, eventName, properties };
  }

  setHooks(pbjs) {
    this.log("Processing past events");
    pbjs.getEvents().forEach((event) => {
      if (event.eventType === "auctionInit") {
        this.missedAuctionIds.add(event.args.auctionId);
      } else if (event.eventType === "auctionEnd") {
        this.missedAuctionIds.delete(event.args.auctionId);
        this.log(`auction ${event.args.auctionId} missed (completed before hook)`);
        this.trackAuctionEnd(event.args, true);
      }
    });

    this.log("Hooking into Prebid.js events");
    pbjs.onEvent("auctionEnd", (event) => {
      const missed = this.missedAuctionIds.has(event.auctionId);
      if (missed) {
        this.missedAuctionIds.delete(event.auctionId);
      }
      this.log(`auctionEnd event received, missed=${missed}`);
      this.trackAuctionEnd(event, missed);
    });
  }

  /**
   * Hook into Prebid.js events
   */
  hookIntoPrebid(prebidInstance = window.pbjs) {
    const pbjs = prebidInstance;
    this.prebidInstance = pbjs;
    if (typeof pbjs === "undefined") {
      this.log("Prebid.js not found");
      return false;
    }

    if (typeof pbjs.onEvent !== "function") {
      pbjs.que = pbjs.que || [];
      pbjs.que.push(() => this.setHooks(pbjs));
    } else {
      this.setHooks(pbjs);
    }
    return true;
  }

  async trackAuctionEnd(event, missed) {
    const { auctionId, timeout, bidderRequests = [], bidsReceived = [], noBids = [], timeoutBids = [] } = event;

    window.optable.pageAuctionIndex = (Number(window.optable.pageAuctionIndex) || 0) + 1;

    this.log(`Processing auction ${auctionId} with ${bidderRequests.length} bidder requests`);

    // Build auction object with bidder requests and EID flags
    const auction = {
      auctionId,
      timeout,
      bidderRequests: bidderRequests.map((br) => {
        const { bidderCode, bidderRequestId, ortb2, bids = [] } = br;
        const domain = ortb2?.site?.domain;
        const eids = [...(ortb2?.user?.ext?.eids ?? []), ...(ortb2?.user?.eids ?? [])];

        // Optable EIDs
        const optableEIDS = eids.filter((e) => e.inserter === "optable.co");
        const optableMatchers = [...new Set(optableEIDS.map((e) => e.matcher).filter(Boolean))];
        const optableSources = [...new Set(optableEIDS.map((e) => e.source).filter(Boolean))];

        // LiveIntent EIDs
        const liveintentEIDS = eids
          .filter((e) => e.uids?.some((u) => u.ext?.provider === "liveintent.com"))
          .map((e) => ({ ...e, uids: e.uids.filter((u) => u.ext?.provider === "liveintent.com") }));
        const liSources = [...new Set(liveintentEIDS.map((e) => e.source).filter(Boolean))];

        return {
          bidderCode,
          bidderRequestId,
          domain,
          hasOEids: optableEIDS.length > 0,
          optableMatchers,
          optableSources,
          hasLiEids: liveintentEIDS.length > 0,
          liSources,
          status: STATUS.REQUESTED,
          bids: bids.map((b) => ({
            bidId: b.bidId,
            bidderRequestId,
            adUnitCode: b.adUnitCode,
            adUnitId: b.adUnitId,
            transactionId: b.transactionId,
            src: b.src,
            floorMin: b.floorData?.floorMin,
            splitTestAssignment: b.ortb2Imp?.ext?.optable?.splitTestAssignment,
            status: STATUS.REQUESTED,
          })),
        };
      }),
    };

    // Build lookup tables for 1:many relationship
    const requestIndex = {};
    const bidIndex = {};
    const bidToRequest = {};

    auction.bidderRequests.forEach((br) => {
      requestIndex[br.bidderRequestId] = br;
      br.bids.forEach((bid) => {
        bidIndex[bid.bidId] = bid;
        bidToRequest[bid.bidId] = br;
      });
    });

    // Merge in bidsReceived → update individual bids as RECEIVED
    bidsReceived.forEach((b) => {
      const bidId = b.requestId;
      const br = bidToRequest[bidId];
      if (!br) {
        this.log(`No bidderRequest found for bidId=${bidId}`);
        return;
      }

      // Find the specific bid to update
      let bidObj = bidIndex[bidId];
      if (bidObj) {
        // Update existing bid
        Object.assign(bidObj, {
          status: STATUS.RECEIVED,
          cpm: b.cpm,
          size: `${b.width}x${b.height}`,
          currency: b.currency,
          splitTestAssignment: b.ortb2Imp?.ext?.optable?.splitTestAssignment,
        });
      } else {
        // Create new bid object for this response
        bidObj = {
          bidId,
          bidderRequestId: br.bidderRequestId,
          adUnitCode: b.adUnitCode,
          adUnitId: b.adUnitId,
          transactionId: b.transactionId,
          src: b.src,
          cpm: b.cpm,
          size: `${b.width}x${b.height}`,
          currency: b.currency,
          status: STATUS.RECEIVED,
          splitTestAssignment: b.ortb2Imp?.ext?.optable?.splitTestAssignment,
        };
        br.bids.push(bidObj);
        bidIndex[bidId] = bidObj;
        bidToRequest[bidId] = br;
      }

      // Update bidder request status to RECEIVED if any bid was received
      if (br.status === STATUS.REQUESTED) {
        br.status = STATUS.RECEIVED;
      }
    });

    // Handle noBids → mark the entire request as NO_BID
    noBids.forEach((nb) => {
      const br = requestIndex[nb.bidderRequestId];
      if (!br) return;
      br.status = STATUS.NO_BID;
      // Mark all bids in this request as NO_BID
      br.bids.forEach((bid) => {
        bid.status = STATUS.NO_BID;
      });
    });

    // Handle timeoutBids → mark the entire request as TIMEOUT
    timeoutBids.forEach((tb) => {
      const br = requestIndex[tb.bidderRequestId];
      if (!br) return;
      br.status = STATUS.TIMEOUT;
      // Mark all bids in this request as TIMEOUT
      br.bids.forEach((bid) => {
        bid.status = STATUS.TIMEOUT;
      });
    });

    // Store the processed auction
    this.auctions[auctionId] = auction;

    // Clean up old auctions
    this.cleanupOldAuctions();

    // Send to Witness API
    try {
      const oMatchersSet = new Set();
      const oSourcesSet = new Set();
      const lSourcesSet = new Set();
      let adUnitCode;
      let totalBids = 0;

      const witnessData = {
        bidderRequests: auction.bidderRequests.map((br) => {
          br.optableMatchers.forEach((m) => oMatchersSet.add(m));
          br.optableSources.forEach((s) => oSourcesSet.add(s));
          br.liSources.forEach((s) => lSourcesSet.add(s));
          return {
            bidderCode: br.bidderCode,
            bids: br.bids.map((b) => {
              adUnitCode = adUnitCode || b.adUnitCode;
              if (b.cpm != null) totalBids += 1;
              return {
                floorMin: b.floorMin,
                cpm: b.cpm,
                size: b.size,
                bidId: b.bidId,
                splitTestAssignment: b.splitTestAssignment,
              };
            }),
          };
        }),
        auctionId,
        adUnitCode,
        totalRequests: bidderRequests.length,
        totalBids,
        optableMatchers: Array.from(oMatchersSet),
        optableSources: Array.from(oSourcesSet),
        liveintentEIDs: Array.from(lSourcesSet),
        missed,
        url: `${window.location.hostname}${window.location.pathname}`,
        ...getTrafficSource(),
        tenant: this.config.tenant,
        optableWrapperVersion: SDK_WRAPPER_VERSION, // eslint-disable-line no-undef
        prebidjsVersion: this.prebidInstance?.version || "unknown",
        sessionDepth: sessionStorage?.optableSessionDepthIndex || 1,
        pageAuctionsCount: window.optable?.pageAuctionIndex || 1,
        originSlug: window.optable?.site || this.optableInstance?.dcn?.site || "unknown", // optable.site first since dcn is analytics always
      };
      // Log summary with bid counts
      this.log(
        `Auction ${auctionId} processed: ${bidderRequests.length} requests, ${totalBids} total bids, ${bidsReceived.length} received, ${noBids.length} no-bids, ${timeoutBids.length} timeouts`
      );

      if (window.optable.customAnalytics) {
        await window.optable.customAnalytics().then((response) => {
          this.log(`Adding custom data to payload ${JSON.stringify(response)}`);
          Object.assign(witnessData, response);
        });
      }
      await this.sendToWitnessAPI("auction_processed", {
        auction: JSON.stringify(witnessData),
      });
    } catch (error) {
      this.log("Failed to send auction data to Witness:", error);
    }
  }

  /**
   * Clean up old auctions to prevent memory leaks
   */
  cleanupOldAuctions() {
    const auctionIds = Object.keys(this.auctions);
    if (auctionIds.length > this.maxAuctionDataSize) {
      const oldestAuctionId = auctionIds[0];
      delete this.auctions[oldestAuctionId];
      this.log(`Cleaned up old auction: ${oldestAuctionId}`);
    }
  }

  /**
   * Clear all stored data (useful for testing)
   */
  clearData() {
    this.auctions = {};
    this.missedAuctionIds.clear();
    this.log("All analytics data cleared");
  }
}

export default OptablePrebidAnalytics;
