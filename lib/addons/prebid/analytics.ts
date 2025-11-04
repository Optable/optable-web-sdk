/* eslint-disable no-param-reassign */
/* eslint-disable no-console */
import type { WitnessProperties } from "../../edge/witness";
import type OptableSDK from "../../sdk";

declare const SDK_WRAPPER_VERSION: string;

declare global {
  interface Window {
    optable?: any;
    pbjs?: any;
  }
}

const STATUS = {
  REQUESTED: "REQUESTED",
  RECEIVED: "RECEIVED",
  NO_BID: "NO_BID",
  TIMEOUT: "TIMEOUT",
};

interface OptablePrebidAnalyticsConfig {
  debug?: boolean;
  analytics?: boolean;
  tenant?: string;
  samplingSeed?: string;
  samplingRate?: number;
  samplingRateFn?: () => boolean;
}

interface AuctionItem {
  auctionEnd: unknown | null;
  missed: boolean;
  createdAt: Date;
}

class OptablePrebidAnalytics {
  public readonly isInitialized: boolean = false;

  private readonly labelStyle = "color: white; background-color: #9198dc; padding: 2px 4px; border-radius: 2px;";
  private readonly maxAuctionDataSize: number = 50;

  private auctions = new Map<string, AuctionItem>();

  constructor(
    private readonly optableInstance: OptableSDK,
    private config: OptablePrebidAnalyticsConfig = {}
  ) {
    if (!optableInstance || typeof optableInstance.witness !== "function") {
      throw new Error("OptablePrebidAnalytics requires a valid optable instance with witness() method");
    }

    this.config.debug = config.debug ?? false;
    this.config.samplingRate = config.samplingRate ?? 1;

    this.isInitialized = true;

    // Store auction data
    this.maxAuctionDataSize = 50;

    this.log("OptablePrebidAnalytics initialized");
  }

  /**
   * Log messages if debug is enabled
   */
  log(...args: unknown[]) {
    if (this.config.debug) {
      console.log("%cOptable%c [OptablePrebidAnalytics]", this.labelStyle, "color: inherit;", ...args);
    }
  }

  shouldSample(): boolean {
    if (this.config.samplingRate! <= 0) return false;
    if (this.config.samplingRate! >= 1) return true;

    if (this.config.samplingRateFn) {
      return this.config.samplingRateFn();
    }

    // Optional: deterministic sampling by seed (e.g., user ID)
    if (this.config.samplingSeed) {
      const hash = [...this.config.samplingSeed].reduce((acc, c) => acc + c.charCodeAt(0), 0);
      const normalized = (hash % 10000) / 10000;
      return normalized < this.config.samplingRate!;
    }

    // Random sampling
    return Math.random() < this.config.samplingRate!;
  }

  /**
   * Send event to Witness API
   */
  async sendToWitnessAPI(eventName: string, properties: Record<string, any> = {}) {
    if (!this.config.analytics) {
      this.log("Witness API calls disabled - would send:", eventName, properties);
      return { disabled: true, eventName, properties };
    }

    if (!this.shouldSample()) {
      this.log("Event not sampled - skipping Witness API call for:", eventName, properties);
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

  setHooks(pbjs: any) {
    this.log("Processing missed auctionEnd");
    pbjs.getEvents().forEach((event: any) => {
      if (event.eventType === "auctionEnd") {
        this.log("auction missed");
        this.trackAuctionEnd(event.args, true);
      }
      if (event.eventType === "bidWon") {
        this.log("bid won missed");
        this.trackBidWon(event.args, true);
      }
    });

    this.log("Hooking into Prebid.js events");
    pbjs.onEvent("auctionEnd", (event: any) => {
      this.log("auctionEnd event received");
      this.trackAuctionEnd(event);
    });
    pbjs.onEvent("bidWon", (event: any) => {
      this.log("bidWon event received");
      this.trackBidWon(event);
    });
  }

  /**
   * Hook into Prebid.js events
   */
  hookIntoPrebid(prebidInstance = window.pbjs) {
    const pbjs = prebidInstance;
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

  async trackAuctionEnd(event: any, missed: boolean = false) {
    const { auctionId, timeout, bidderRequests = [], bidsReceived = [], noBids = [], timeoutBids = [] } = event;

    this.log(`Processing auction ${auctionId} with ${bidderRequests.length} bidder requests`);

    // Build auction object with bidder requests and EID flags
    const auction = {
      auctionId,
      timeout,
      bidderRequests: bidderRequests.map((br: any) => {
        const {
          bidderCode,
          bidderRequestId,
          ortb2: {
            site: { domain },
            user: {
              ext: { eids },
            },
          },
          bids = [],
        } = br;

        // Optable EIDs
        const optableEIDS = eids.filter((e: { inserter: string }) => e.inserter === "optable.co");
        const optableMatchers = [...new Set(optableEIDS.map((e: any) => e.matcher).filter(Boolean))];
        const optableSources = [...new Set(optableEIDS.map((e: any) => e.source).filter(Boolean))];

        return {
          bidderCode,
          bidderRequestId,
          domain,
          hasOEids: optableEIDS.length > 0,
          optableMatchers,
          optableSources,
          status: STATUS.REQUESTED,
          bids: bids.map(
            (b: {
              bidId: string;
              adUnitCode: string;
              adUnitId: string;
              transactionId: string;
              src: string;
              floorData?: { floorMin: number };
            }) => ({
              bidId: b.bidId,
              bidderRequestId,
              adUnitCode: b.adUnitCode,
              adUnitId: b.adUnitId,
              transactionId: b.transactionId,
              src: b.src,
              floorMin: b.floorData?.floorMin,
              status: STATUS.REQUESTED,
            })
          ),
        };
      }),
    };

    // Build lookup tables for 1:many relationship
    const requestIndex: { [key: string]: any } = {};
    const bidIndex: { [key: string]: any } = {};
    const bidToRequest: { [key: string]: any } = {};

    auction.bidderRequests.forEach((br: { bidderRequestId: string; bids: Array<{ bidId: string }> }) => {
      requestIndex[br.bidderRequestId] = br;

      br.bids.forEach((bid) => {
        bidIndex[bid.bidId] = bid;
        bidToRequest[bid.bidId] = br;
      });
    });

    // Merge in bidsReceived → update individual bids as RECEIVED
    bidsReceived.forEach((b: any) => {
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
    noBids.forEach((nb: { bidderRequestId: string }) => {
      const br = requestIndex[nb.bidderRequestId];
      if (!br) return;
      br.status = STATUS.NO_BID;
      // Mark all bids in this request as NO_BID
      br.bids.forEach((bid: { status: string }) => {
        bid.status = STATUS.NO_BID;
      });
    });

    // Handle timeoutBids → mark the entire request as TIMEOUT
    timeoutBids.forEach((tb: { bidderRequestId: string }) => {
      const br = requestIndex[tb.bidderRequestId];
      if (!br) return;
      br.status = STATUS.TIMEOUT;
      // Mark all bids in this request as TIMEOUT
      br.bids.forEach((bid: { status: string }) => {
        bid.status = STATUS.TIMEOUT;
      });
    });

    // Store the processed auction
    this.auctions.set(auctionId, { auctionEnd: event, createdAt: new Date(), missed });

    // Clean up old auctions
    this.cleanupOldAuctions();
  }

  async trackBidWon(event: any, missed: boolean = false) {
    const filteredEvent = {
      auctionId: event.auctionId,
      bidderCode: event.bidderCode,
      bidId: event.requestId,
      tenant: this.config.tenant,
      missed,
    };
    this.log("bidWon filtered event", filteredEvent);

    const auction = this.auctions.get(event.auctionId);
    if (!auction) {
      this.log("Missing 'auctionEnd' event. Skipping.");
      return;
    }

    const payload = await this.toWitness(auction.auctionEnd, event, missed);
    payload["auctionEndAt"] = auction.createdAt.toISOString();
    payload["bidWonAt"] = new Date().toISOString();
    payload["missed"] = missed;

    this.sendToWitnessAPI("optable.prebid.auction", payload);
  }

  /**
   * Clean up old auctions to prevent memory leaks
   */
  cleanupOldAuctions() {
    const auctionIds = [...this.auctions.keys()];
    if (auctionIds.length > this.maxAuctionDataSize) {
      const oldestAuctionId = auctionIds[0];
      this.auctions.delete(oldestAuctionId);
      this.log(`Cleaned up old auction: ${oldestAuctionId}`);
    }
  }

  /**
   * Clear all stored data (useful for testing)
   */
  clearData() {
    this.auctions.clear();
    this.log("All analytics data cleared");
  }

  async toWitness(auctionEndEvent: any, bidWonEvent: any, missed = false): Promise<Record<string, any>> {
    const { auctionId, bidderRequests = [], bidsReceived = [], noBids = [], timeoutBids = [] } = auctionEndEvent;

    const oMatchersSet = new Set();
    const oSourcesSet = new Set();
    let adUnitCode: string = "unknown";
    let totalBids = 0;

    const requests = bidderRequests.map((br: any) => {
      const {
        bidderCode,
        bidderRequestId,
        ortb2: {
          site: { domain },
          user: {
            ext: { eids },
          },
        },
        bids = [],
      } = br;

      // Optable EIDs
      const optableEIDS = eids.filter((e: { inserter: string }) => e.inserter === "optable.co");
      const optableMatchers = [...new Set(optableEIDS.map((e: any) => e.matcher).filter(Boolean))];
      const optableSources = [...new Set(optableEIDS.map((e: any) => e.source).filter(Boolean))];

      return {
        bidderCode,
        bidderRequestId,
        domain,
        hasOptable: optableEIDS.length > 0,
        optableMatchers,
        optableSources,
        status: STATUS.REQUESTED,
        bids: bids.map(
          (b: {
            bidId: string;
            adUnitCode: string;
            adUnitId: string;
            transactionId: string;
            src: string;
            floorData?: { floorMin: number };
          }) => ({
            bidId: b.bidId,
            bidderRequestId,
            adUnitCode: b.adUnitCode,
            adUnitId: b.adUnitId,
            transactionId: b.transactionId,
            src: b.src,
            floorMin: b.floorData?.floorMin,
            status: STATUS.REQUESTED,
          })
        ),
      };
    });

    const witnessData: WitnessProperties = {
      bidderRequests: requests.map((br: any) => {
        br.optableMatchers.forEach((m: unknown) => oMatchersSet.add(m));
        br.optableSources.forEach((s: unknown) => oSourcesSet.add(s));

        return {
          bidderCode: br.bidderCode,
          bids: br.bids.map((b: any) => {
            adUnitCode = adUnitCode || b.adUnitCode;

            if (b.cpm != null) totalBids += 1;

            return { floorMin: b.floorMin, cpm: b.cpm, size: b.size, bidId: b.bidId };
          }),
        };
      }),
      auctionId,
      adUnitCode,
      totalRequests: bidderRequests.length,
      totalBids,
      optableMatchers: Array.from(oMatchersSet),
      optableSources: Array.from(oSourcesSet),
      bidWon: {
        message:
          bidWonEvent.bidderCode +
          " won the ad server auction for ad unit " +
          bidWonEvent.adUnitCode +
          " at " +
          bidWonEvent.cpm +
          " CPM",
        bidderCode: bidWonEvent.bidderCode,
        adUnitCode: bidWonEvent.adUnitCode,
        cpm: bidWonEvent.cmp,
      },
      missed,
      url: `${window.location.hostname}${window.location.pathname}`,
      tenant: this.config.tenant!,
      // eslint-disable-next-line no-undef
      optableWrapperVersion: SDK_WRAPPER_VERSION || "unknown",
    };

    // Log summary with bid counts
    this.log(
      `Auction ${auctionId} processed: ${bidderRequests.length} requests, ${totalBids} total bids, ${bidsReceived.length} received, ${noBids.length} no-bids, ${timeoutBids.length} timeouts`
    );

    if (window.optable?.customAnalytics) {
      await window.optable.customAnalytics().then((response: any) => {
        this.log(`Adding custom data to payload ${JSON.stringify(response)}`);
        Object.assign(witnessData, response);
      });
    }

    return witnessData;
  }
}

export default OptablePrebidAnalytics;
