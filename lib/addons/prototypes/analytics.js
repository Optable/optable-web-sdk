/* eslint-disable no-param-reassign */
/* eslint-disable no-console */
const STATUS = {
  REQUESTED: "REQUESTED",
  RECEIVED: "RECEIVED",
  NO_BID: "NO_BID",
  TIMEOUT: "TIMEOUT",
};
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
    this.maxAuctionDataSize = 20;

    this.log("OptablePrebidAnalytics initialized");
  }

  /**
   * Log messages if debug is enabled
   */
  log(...args) {
    if (this.config.debug) {
      console.log("[OptablePrebidAnalytics]", ...args);
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
    this.log("Processing missed auctionEnd");
    pbjs.getEvents().forEach((event) => {
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
    pbjs.onEvent("auctionEnd", (event) => {
      this.log("auctionEnd event received");
      this.trackAuctionEnd(event);
    });
    pbjs.onEvent("bidWon", (event) => {
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

  async trackAuctionEnd(event, missed) {
    const { auctionId, timeout, bidderRequests = [], bidsReceived = [], noBids = [], timeoutBids = [] } = event;

    this.log(`Processing auction ${auctionId} with ${bidderRequests.length} bidder requests`);

    // Build auction object with bidder requests and EID flags
    const auction = {
      auctionId,
      timeout,
      bidderRequests: bidderRequests.map((br) => {
        const { bidderCode, bidderRequestId, ortb2, bids = [] } = br;
        const domain = ortb2?.site?.domain;
        const eids = ortb2?.user?.ext?.eids;

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
        tenant: this.config.tenant,
        // eslint-disable-next-line no-undef
        optableWrapperVersion: SDK_WRAPPER_VERSION,
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

  trackBidWon(event, missed) {
    const filteredEvent = {
      auctionId: event.auctionId,
      bidderCode: event.bidderCode,
      bidId: event.requestId,
      tenant: this.config.tenant,
      missed,
    };
    this.log("bidWon filtered event", filteredEvent);
    this.sendToWitnessAPI("bid_won", filteredEvent);
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
    this.log("All analytics data cleared");
  }
}

export default OptablePrebidAnalytics;
