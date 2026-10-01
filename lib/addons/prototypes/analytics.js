/* eslint-disable no-param-reassign */
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
    this.missedAuctionIds = new Set();
    this.maxAuctionDataSize = 20;

    // Page-level state for the capture fields
    this.slotAuctionCounts = {};
    this.storageBlocked = false;

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
      if (event.eventType === "tcf2Enforcement") {
        this.noteTcfEnforcement(event.args);
      } else if (event.eventType === "auctionInit") {
        this.missedAuctionIds.add(event.args.auctionId);
      } else if (event.eventType === "auctionEnd") {
        this.missedAuctionIds.delete(event.args.auctionId);
        this.log(`auction ${event.args.auctionId} missed (completed before hook)`);
        this.trackAuctionEnd(event.args, true);
      }
    });

    this.log("Hooking into Prebid.js events");
    pbjs.onEvent("tcf2Enforcement", (event) => this.noteTcfEnforcement(event));
    pbjs.onEvent("auctionEnd", (event) => {
      const missed = this.missedAuctionIds.has(event.auctionId);
      if (missed) {
        this.missedAuctionIds.delete(event.auctionId);
      }
      this.log(`auctionEnd event received, missed=${missed}`);
      this.trackAuctionEnd(event, missed);
    });
  }

  noteTcfEnforcement(args) {
    if (args?.storageBlocked?.length) {
      this.storageBlocked = true;
    }
  }

  /**
   * Consent state at this auction, as a bitmask:
   * 1 GDPR applies, 2 Global Privacy Control, 4 US privacy opt-out,
   * 8 GPP string present, 16 TCF blocked storage for some module on this page.
   */
  consentFlags(bidderRequest) {
    let flags = 0;
    if (bidderRequest?.gdprConsent?.gdprApplies) flags |= 1;
    if (typeof navigator !== "undefined" && navigator.globalPrivacyControl === true) flags |= 2;
    if (typeof bidderRequest?.uspConsent === "string" && bidderRequest.uspConsent.charAt(2) === "Y") flags |= 4;
    if (bidderRequest?.gppConsent?.gppString) flags |= 8;
    if (this.storageBlocked) flags |= 16;
    return flags;
  }

  /**
   * Targeting cache state. cacheAge is seconds since the cache was written, -1 when there is
   * no cache, and absent when the cache predates the write timestamp. idsMs is set when the
   * cache was written during this page view: ms from page start to our IDs landing.
   */
  cacheState() {
    const key = this.config.cacheKey || "OPTABLE_RESOLVED";
    try {
      if (!localStorage.getItem(key)) return { cacheAge: -1 };
      const ts = Number(localStorage.getItem(`${key}:ts`));
      if (!ts) return {};
      const state = { cacheAge: Math.max(0, Math.round((Date.now() - ts) / 1000)) };
      const origin = typeof performance !== "undefined" ? performance.timeOrigin : undefined;
      if (origin && ts >= origin) state.idsMs = Math.round(ts - origin);
      return state;
    } catch (e) {
      return {};
    }
  }

  /**
   * Page configuration, sent on the first auction of the page only.
   */
  pageConfig() {
    const getConfig = this.prebidInstance?.getConfig;
    if (typeof getConfig !== "function") return undefined;
    try {
      const rtd = this.prebidInstance.getConfig("realTimeData") || {};
      const userSync = this.prebidInstance.getConfig("userSync") || {};
      return {
        rtdOptable: (rtd.dataProviders || []).some((p) => p?.name === "optable") ? 1 : 0,
        rtdDelay: rtd.auctionDelay,
        udDelay: userSync.auctionDelay,
      };
    } catch (e) {
      return undefined;
    }
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
    const {
      auctionId,
      timeout,
      timestamp,
      bidderRequests = [],
      bidsReceived = [],
      noBids = [],
      timeoutBids = [],
    } = event;
    let unmatchedBids = 0;

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
      let bidId = b.requestId;
      let br = bidToRequest[bidId];
      if (!br) {
        // Prebid Server responses can carry a requestId that matches no client bidId.
        // Fall back to the same bidder and ad unit, first bid still waiting for a response.
        const bidderCode = b.bidderCode || b.bidder;
        const candidate = auction.bidderRequests.find(
          (r) => r.bidderCode === bidderCode && r.bids.some((x) => x.adUnitCode === b.adUnitCode && x.cpm == null)
        );
        const match = candidate?.bids.find((x) => x.adUnitCode === b.adUnitCode && x.cpm == null);
        if (!match) {
          unmatchedBids += 1;
          this.log(`No bidderRequest found for bidId=${bidId}`);
          return;
        }
        br = candidate;
        bidId = match.bidId;
      }

      // Find the specific bid to update
      let bidObj = bidIndex[bidId];
      if (bidObj) {
        // Update existing bid
        Object.assign(bidObj, {
          status: STATUS.RECEIVED,
          source: b.source,
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
          source: b.source,
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

      auction.bidderRequests.forEach((br) => {
        br.optableMatchers.forEach((m) => oMatchersSet.add(m));
        br.optableSources.forEach((s) => oSourcesSet.add(s));
        br.liSources.forEach((s) => lSourcesSet.add(s));
      });
      const auctionSources = Array.from(oSourcesSet);
      // Per-bidder delivery as a bitmask over auctionSources (bit i = auctionSources[i]).
      // Omitted when the bidder received every source, so the usual case adds nothing.
      const fullMask = auctionSources.length && auctionSources.length <= 30 ? 2 ** auctionSources.length - 1 : 0;

      const witnessData = {
        bidderRequests: auction.bidderRequests.map((br) => {
          const out = {
            bidderCode: br.bidderCode,
            bids: br.bids.map((b) => {
              adUnitCode = adUnitCode || b.adUnitCode;
              if (b.cpm != null) totalBids += 1;
              const bid = {
                floorMin: b.floorMin,
                cpm: b.cpm,
                size: b.size,
                bidId: b.bidId,
                splitTestAssignment: b.splitTestAssignment,
              };
              if (b.source === "s2s") bid.src = "s2s";
              return bid;
            }),
          };
          if (fullMask) {
            const mask = auctionSources.reduce((m, s, i) => (br.optableSources.includes(s) ? m + 2 ** i : m), 0);
            if (mask !== fullMask) out.om = mask;
          }
          return out;
        }),
        auctionId,
        adUnitCode,
        totalRequests: bidderRequests.length,
        totalBids,
        optableMatchers: Array.from(oMatchersSet),
        optableSources: auctionSources,
        liveintentEIDs: Array.from(lSourcesSet),
        missed,
        url: `${window.location.hostname}${window.location.pathname}`,
        tenant: this.config.tenant,
        optableWrapperVersion: SDK_WRAPPER_VERSION, // eslint-disable-line no-undef
        prebidjsVersion: this.prebidInstance?.version || "unknown",
        sessionDepth: sessionStorage?.optableSessionDepthIndex || 1,
        pageAuctionsCount: window.optable?.pageAuctionIndex || 1,
        originSlug: window.optable?.site || this.optableInstance?.dcn?.site || "unknown", // optable.site first since dcn is analytics always
      };

      // Capture fields for troubleshooting (see lib/addons/prototypes/README.md)
      const slotKey = adUnitCode || event.adUnitCodes?.[0];
      if (slotKey) {
        witnessData.slotSeq = this.slotAuctionCounts[slotKey] || 0;
        this.slotAuctionCounts[slotKey] = witnessData.slotSeq + 1;
      }
      const origin = typeof performance !== "undefined" ? performance.timeOrigin : undefined;
      if (typeof timestamp === "number" && origin) witnessData.t0 = Math.round(timestamp - origin);
      witnessData.consent = this.consentFlags(bidderRequests[0]);
      Object.assign(witnessData, this.cacheState());
      if (unmatchedBids) witnessData.unmatchedBids = unmatchedBids;
      if (witnessData.pageAuctionsCount === 1) {
        const page = this.pageConfig();
        if (page) witnessData.page = page;
      }
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
