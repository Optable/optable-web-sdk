/* eslint-disable no-param-reassign */
/* eslint-disable no-console */
import type { WitnessProperties } from "../../edge/witness";
import type OptableSDK from "../../sdk";

import * as Bowser from "bowser";

declare const SDK_WRAPPER_VERSION: string;

declare global {
  interface Window {
    pbjs?: any;
  }
}

const STATUS = {
  REQUESTED: "REQUESTED",
  RECEIVED: "RECEIVED",
  NO_BID: "NO_BID",
  TIMEOUT: "TIMEOUT",
};

const SESSION_SAMPLE_KEY = "optable:prebid:analytics:sample-number";

interface OptablePrebidAnalyticsConfig {
  debug?: boolean;
  analytics?: boolean;
  tenant?: string;
  bidWinTimeout?: number;
  samplingVolume?: "session" | "event";
  samplingSeed?: string;
  samplingRate?: number;
  samplingRateFn?: () => boolean;
}

interface AuctionItem {
  auctionEnd: unknown | null;
  auctionEndTimeoutId: NodeJS.Timeout | null;
  missed: boolean;
  createdAt: Date;
}

class OptablePrebidAnalytics {
  public readonly isInitialized: boolean = false;

  private readonly labelStyle = "color: white; background-color: #9198dc; padding: 2px 4px; border-radius: 2px;";
  private readonly maxAuctionDataSize: number = 50;

  private auctions = new Map<string, AuctionItem>();

  /**
   * Create a new OptablePrebidAnalytics instance.
   * @param optableInstance - An initialized Optable SDK instance that exposes a `witness()` method.
   * @param config - Optional configuration for sampling, debug and analytics behavior.
   */
  constructor(
    private readonly optableInstance: OptableSDK,
    private config: OptablePrebidAnalyticsConfig = { samplingRate: 1, samplingVolume: "event", bidWinTimeout: 10_000 }
  ) {
    if (!optableInstance || typeof optableInstance.witness !== "function") {
      throw new Error("OptablePrebidAnalytics requires a valid optable instance with witness() method");
    }

    this.config.debug = config.debug ?? false;
    this.config.bidWinTimeout = config.bidWinTimeout ?? 10_000;
    this.config.samplingRate = config.samplingRate ?? 1;
    this.config.samplingVolume = config.samplingVolume ?? "event";

    if (this.config.samplingVolume === "session") {
      sessionStorage.setItem(SESSION_SAMPLE_KEY, Math.random().toFixed(2));
    } else {
      sessionStorage.removeItem(SESSION_SAMPLE_KEY);
    }

    this.isInitialized = true;

    // Store auction data
    this.maxAuctionDataSize = 50;

    this.log("OptablePrebidAnalytics initialized");
  }

  /**
   * Log messages to the console when debugging is enabled.
   * @param args - Values to log.
   * @returns void
   */
  log(...args: unknown[]) {
    if (this.config.debug) {
      console.log("%cOptable%c [OptablePrebidAnalytics]", this.labelStyle, "color: inherit;", ...args);
    }
  }

  /**
   * Determine whether the current event/session should be sampled according to
   * the configured sampling rate, seed or function.
   * @returns true if the event should be sampled and analytics calls may proceed.
   */
  shouldSample(): boolean {
    if (this.config.samplingRate! <= 0) return false;
    if (this.config.samplingRate! >= 1) return true;

    if (this.config.samplingRateFn) {
      return this.config.samplingRateFn();
    }

    if (this.config.samplingVolume === "session") {
      const samplingNumber = Number(sessionStorage.getItem(SESSION_SAMPLE_KEY) || "1");
      return samplingNumber < this.config.samplingRate!;
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
   * Send an event to the Witness API when analytics are enabled and sampling passes.
   * @param eventName - The name of the event to send (e.g. "optable.prebid.auction").
   * @param properties - An object of event properties to include in the payload.
   * @returns A small result object indicating whether the call was disabled or sent.
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

  /**
   * Attach listeners to a Prebid.js instance and process any missed events.
   * This will replay past `auctionEnd` and `bidWon` events and then register live handlers.
   * @param pbjs - The Prebid.js global instance (or equivalent) to hook into.
   * @returns void
   */
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
   * Hook into Prebid.js by attaching event hooks either immediately or by
   * queueing callbacks when `pbjs.onEvent` is not available yet.
   * @param prebidInstance - Optional Prebid.js instance to use (defaults to `window.pbjs`).
   * @returns true when a hook has been registered, false when Prebid is not present.
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

  /**
   * Process a Prebid `auctionEnd` event: build an internal representation of
   * requests, merge in received bids and schedule a delayed Witness API call
   * (to allow `bidWon` to be received) or mark as missed.
   * @param event - The raw Prebid auctionEnd event object.
   * @param missed - True when the event was previously emitted (missed replay).
   * @returns void
   */
  async trackAuctionEnd(event: any, missed: boolean = false) {
    const { auctionId, timeout, bidderRequests = [], bidsReceived = [], noBids = [], timeoutBids = [] } = event;

    this.log(`Processing auction ${auctionId} with ${bidderRequests.length} bidder requests`);

    // Build auction object with bidder requests and EID flags
    const auction = {
      auctionId,
      timeout,
      bidderRequests: bidderRequests.map((br: any) => {
        const { bidderCode, bidderRequestId, bids = [] } = br;
        const domain = br.ortb2.site?.domain ?? "unknown";
        const eids = br.ortb2.user?.eids ?? [];

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

    const createdAt = new Date();
    const auctionEndTimeoutId = setTimeout(async () => {
      const payload = await this.toWitness(event, null, missed);
      payload["auctionEndAt"] = createdAt.toISOString();
      payload["bidWonAt"] = null;
      payload["optableLoaded"] = !missed;

      this.sendToWitnessAPI("optable.prebid.auction", payload);
    }, this.config.bidWinTimeout);

    // Store the processed auction
    this.auctions.set(auctionId, { auctionEnd: event, createdAt, missed, auctionEndTimeoutId });

    // Clean up old auctions
    this.cleanupOldAuctions();
  }

  /**
   * Handle a Prebid `bidWon` event by finalizing the matching auction, clearing
   * the pending timeout and sending the combined payload to Witness.
   * @param event - The raw Prebid bidWon event object.
   * @param missed - True when the event was previously emitted (missed replay).
   * @returns void
   */
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

    if (auction.auctionEndTimeoutId) {
      clearTimeout(auction.auctionEndTimeoutId);
    }

    const payload = await this.toWitness(auction.auctionEnd, event, missed);
    payload["auctionEndAt"] = auction.createdAt.toISOString();
    payload["bidWonAt"] = new Date().toISOString();
    payload["optableLoaded"] = !missed;

    this.sendToWitnessAPI("optable.prebid.auction", payload);

    this.auctions.delete(event.auctionId);
  }

  /**
   * Clean up old auctions to prevent memory leaks.
   * Removes the oldest auction when the internal store grows past the configured size.
   * @returns void
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
   * Clear all stored analytics data (useful for tests).
   * @returns void
   */
  clearData() {
    this.auctions.clear();
    this.log("All analytics data cleared");
  }

  /**
   * Convert internal auction state and optional bidWon event into a Witness payload.
   * This collects matcher/source metadata, bid counts and optional custom analytics.
   * @param auctionEndEvent - The `auctionEnd` event object from Prebid.js.
   * @param bidWonEvent - Optional `bidWon` event when a winning bid exists.
   * @param missed - True when the original events were already emitted (replayed).
   * @returns A payload object compatible with the Witness API.
   */
  async toWitness(auctionEndEvent: any, bidWonEvent: any | null, missed = false): Promise<Record<string, any>> {
    const { auctionId, bidderRequests = [], bidsReceived = [], noBids = [], timeoutBids = [] } = auctionEndEvent;

    const oMatchersSet = new Set();
    const oSourcesSet = new Set();
    let adUnitCode: string = "unknown";
    let totalBids = 0;
    let device = null;

    const requests = bidderRequests.map((br: any) => {
      const { bidderCode, bidderRequestId, bids = [] } = br;
      const domain = br.ortb2.site?.domain ?? "unknown";
      const eids = br.ortb2.user?.eids ?? [];

      // Optable EIDs
      const optableEIDS = eids.filter((e: { inserter: string }) => e.inserter === "optable.co");
      const optableMatchers = [...new Set(optableEIDS.map((e: any) => e.matcher).filter(Boolean))];
      const optableSources = [...new Set(optableEIDS.map((e: any) => e.source).filter(Boolean))];

      device = br.ortb2.device;

      return {
        bidderCode,
        bidderRequestId,
        domain,
        optableTargetingDone: optableEIDS.length > 0,
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

        return br;
      }),
      auctionId,
      adUnitCode,
      totalRequests: bidderRequests.length,
      optableSampling: this.config.samplingRate || 1,
      optableTargetingDone: oMatchersSet.size || oSourcesSet.size,
      optableMatchers: Array.from(oMatchersSet),
      optableSources: Array.from(oSourcesSet),
      bidWon: bidWonEvent
        ? {
            message:
              bidWonEvent.bidderCode +
              " won the ad server auction for ad unit " +
              bidWonEvent.adUnitCode +
              " at " +
              bidWonEvent.cpm +
              " CPM",
            bidderCode: bidWonEvent.bidderCode,
            adUnitCode: bidWonEvent.adUnitCode,
            cpm: bidWonEvent.cpm,
          }
        : null,
      missed,
      url: `${window.location.hostname}${window.location.pathname}`,
      tenant: this.config.tenant!,
      // eslint-disable-next-line no-undef
      optableWrapperVersion: SDK_WRAPPER_VERSION || "unknown",
      userAgent: Bowser.parse(window.navigator.userAgent) as unknown as Record<string, any>,
      device,
    };

    // Log summary with bid counts
    this.log(
      `Auction ${auctionId} processed: ${bidderRequests.length} requests, ${totalBids} total bids, ${bidsReceived.length} received, ${noBids.length} no-bids, ${timeoutBids.length} timeouts`
    );

    if ((window as any).optable?.customAnalytics) {
      await (window as any).optable.customAnalytics().then((response: any) => {
        this.log(`Adding custom data to payload ${JSON.stringify(response)}`);
        Object.assign(witnessData, response);
      });
    }

    return witnessData;
  }
}

export default OptablePrebidAnalytics;
