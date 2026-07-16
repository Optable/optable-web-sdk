import OptablePrebidAnalytics from "./analytics";
import type OptableSDK from "../../sdk";

// Mock the SDK_WRAPPER_VERSION global
declare global {
  const SDK_WRAPPER_VERSION: string;
}

(global as any).SDK_WRAPPER_VERSION = "1.0.0-test";

describe("OptablePrebidAnalytics", () => {
  let mockOptableInstance: OptableSDK;
  let analytics: OptablePrebidAnalytics;

  beforeEach(() => {
    // Create a mock OptableSDK instance
    mockOptableInstance = {
      witness: jest.fn().mockResolvedValue(undefined),
    } as any;

    // Mock window.location
    delete (window as any).location;
    (window as any).location = {
      hostname: "example.com",
      pathname: "/test",
    };
  });

  afterEach(() => {
    if (analytics) {
      document.removeEventListener("visibilitychange", (analytics as any).handleVisibilityChange);
    }
    jest.clearAllMocks();
  });

  describe("Class instantiation", () => {
    it("should initialize successfully with valid optable instance", () => {
      analytics = new OptablePrebidAnalytics(mockOptableInstance);

      expect(analytics.isInitialized).toBe(true);
    });

    it("should throw error if optable instance is invalid", () => {
      expect(() => {
        new OptablePrebidAnalytics(null as any);
      }).toThrow("OptablePrebidAnalytics requires a valid optable instance with witness() method");
    });

    it("should throw error if optable instance lacks witness method", () => {
      const invalidInstance = {} as any;

      expect(() => {
        new OptablePrebidAnalytics(invalidInstance);
      }).toThrow("OptablePrebidAnalytics requires a valid optable instance with witness() method");
    });

    it("should set default config values", () => {
      analytics = new OptablePrebidAnalytics(mockOptableInstance);

      expect(analytics["config"].debug).toBe(false);
      expect(analytics["config"].samplingRate).toBe(1);
    });

    it("should accept custom config values", () => {
      analytics = new OptablePrebidAnalytics(mockOptableInstance, {
        debug: true,
        samplingRate: 0.5,
        tenant: "test-tenant",
      });

      expect(analytics["config"].debug).toBe(true);
      expect(analytics["config"].samplingRate).toBe(0.5);
      expect(analytics["config"].tenant).toBe("test-tenant");
    });
  });

  describe("shouldSample", () => {
    it("should return false when samplingRate is 0", () => {
      analytics = new OptablePrebidAnalytics(mockOptableInstance, {
        samplingRate: 0,
      });

      expect(analytics.shouldSample()).toBe(false);
    });

    it("should return false when samplingRate is negative", () => {
      analytics = new OptablePrebidAnalytics(mockOptableInstance, {
        samplingRate: -0.5,
      });

      expect(analytics.shouldSample()).toBe(false);
    });

    it("should return true when samplingRate is 1", () => {
      analytics = new OptablePrebidAnalytics(mockOptableInstance, {
        samplingRate: 1,
      });

      expect(analytics.shouldSample()).toBe(true);
    });

    it("should return true when samplingRate is greater than 1", () => {
      analytics = new OptablePrebidAnalytics(mockOptableInstance, {
        samplingRate: 1.5,
      });

      expect(analytics.shouldSample()).toBe(true);
    });

    it("should use custom samplingRateFn when provided", () => {
      const mockSamplingFn = jest.fn().mockReturnValue(true);
      analytics = new OptablePrebidAnalytics(mockOptableInstance, {
        samplingRate: 0.5,
        samplingRateFn: mockSamplingFn,
      });

      const result = analytics.shouldSample();

      expect(mockSamplingFn).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it("should use deterministic sampling with samplingSeed", () => {
      analytics = new OptablePrebidAnalytics(mockOptableInstance, {
        samplingRate: 0.5,
        samplingSeed: "test-seed",
      });

      // Should return consistent result for same seed
      const result1 = analytics.shouldSample();
      const result2 = analytics.shouldSample();

      expect(result1).toBe(result2);
    });

    it("should use random sampling when no seed or function provided", () => {
      analytics = new OptablePrebidAnalytics(mockOptableInstance, {
        samplingRate: 0.5,
      });

      // Mock Math.random to control the result
      const mockRandom = jest.spyOn(Math, "random");
      mockRandom.mockReturnValue(0.3);

      expect(analytics.shouldSample()).toBe(true);

      mockRandom.mockReturnValue(0.7);
      expect(analytics.shouldSample()).toBe(false);

      mockRandom.mockRestore();
    });
  });

  describe("toWitness", () => {
    beforeEach(() => {
      analytics = new OptablePrebidAnalytics(mockOptableInstance, {
        tenant: "test-tenant",
      });
    });

    it("should transform auction and bid won events to witness format", async () => {
      const auctionEndEvent = {
        auctionId: "auction-123",
        bidderRequests: [
          {
            bidderCode: "bidder1",
            bidderRequestId: "req-1",
            ortb2: {
              site: { domain: "example.com" },
              user: {
                eids: [{ inserter: "optable.co", matcher: "matcher1", source: "source1" }],
              },
            },
            bids: [
              {
                bidId: "bid-1",
                adUnitCode: "ad-unit-1",
                adUnitId: "ad-id-1",
                transactionId: "trans-1",
                src: "client",
                floorData: { floorMin: 0.5 },
              },
            ],
          },
        ],
        bidsReceived: [],
        noBids: [],
        timeoutBids: [],
      };

      const bidWonEvent = {
        bidderCode: "bidder1",
        adUnitCode: "ad-unit-1",
        cpm: 1.5,
      };

      const result = await analytics.toWitness(auctionEndEvent, [bidWonEvent]);

      expect(result).toMatchObject({
        auctionId: "auction-123",
        adUnitCode: "unknown",
        totalRequests: 1,
        optableMatchers: ["matcher1"],
        optableSources: ["source1"],
        tenant: "test-tenant",
        url: "example.com/test",
        optableWrapperVersion: "1.0.0-test",
        missed: false,
      });

      expect(result.bidWon).toHaveLength(1);
      expect(result.bidWon[0]).toMatchObject({
        bidderCode: "bidder1",
        adUnitCode: "ad-unit-1",
      });

      expect(result.bidderRequests).toHaveLength(1);
      expect(result.bidderRequests[0]).toMatchObject({
        bidderCode: "bidder1",
        bids: [
          {
            floorMin: 0.5,
            bidId: "bid-1",
          },
        ],
      });
    });

    it("should handle events with no optable EIDs", async () => {
      const auctionEndEvent = {
        auctionId: "auction-456",
        bidderRequests: [
          {
            bidderCode: "bidder2",
            bidderRequestId: "req-2",
            ortb2: {
              site: { domain: "example.com" },
              user: {
                eids: [],
              },
            },
            bids: [],
          },
        ],
        bidsReceived: [],
        noBids: [],
        timeoutBids: [],
      };

      const bidWonEvent = {
        bidderCode: "bidder2",
        adUnitCode: "ad-unit-2",
        cpm: 2.0,
      };

      const result = await analytics.toWitness(auctionEndEvent, [bidWonEvent]);

      expect(result.optableMatchers).toEqual([]);
      expect(result.optableSources).toEqual([]);
    });
  });

  describe("trackAuctionEnd", () => {
    beforeEach(() => {
      analytics = new OptablePrebidAnalytics(mockOptableInstance);
    });

    it("should store auction data", async () => {
      const event = {
        auctionId: "auction-789",
        timeout: 3000,
        bidderRequests: [
          {
            bidderCode: "bidder1",
            bidderRequestId: "req-1",
            ortb2: {
              site: { domain: "example.com" },
              user: {
                eids: [],
              },
            },
            bids: [],
          },
        ],
        bidsReceived: [],
        noBids: [],
        timeoutBids: [],
      };

      await analytics.trackAuctionEnd(event);

      const storedAuction = analytics["auctions"].get("auction-789");
      expect(storedAuction).toBeDefined();
      expect(storedAuction?.auctionEnd).toBe(event);
      expect(storedAuction?.missed).toBe(false);
      expect(storedAuction?.bidWonEvents).toEqual([]);
    });

    it("should mark auction as missed when specified", async () => {
      const event = {
        auctionId: "auction-missed",
        timeout: 3000,
        bidderRequests: [
          {
            bidderCode: "bidder1",
            bidderRequestId: "req-1",
            ortb2: {
              site: { domain: "example.com" },
              user: {
                eids: [],
              },
            },
            bids: [],
          },
        ],
        bidsReceived: [],
        noBids: [],
        timeoutBids: [],
      };

      await analytics.trackAuctionEnd(event, true);

      const storedAuction = analytics["auctions"].get("auction-missed");
      expect(storedAuction?.missed).toBe(true);
    });
  });

  describe("trackBidWon", () => {
    beforeEach(() => {
      jest.useFakeTimers();
      analytics = new OptablePrebidAnalytics(mockOptableInstance, {
        analytics: true,
        tenant: "test-tenant",
      });
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("should skip if auction data is missing", async () => {
      const event = {
        auctionId: "non-existent-auction",
        bidderCode: "bidder1",
        requestId: "bid-1",
        adUnitCode: "ad-unit-1",
        cpm: 1.5,
      };

      await analytics.trackBidWon(event);
      await jest.runAllTimersAsync();

      expect(mockOptableInstance.witness).not.toHaveBeenCalled();
    });

    it("should send witness event when auction data exists", async () => {
      const auctionEndEvent = {
        auctionId: "auction-complete",
        timeout: 3000,
        bidderRequests: [
          {
            bidderCode: "bidder1",
            bidderRequestId: "req-1",
            ortb2: {
              site: { domain: "example.com" },
              user: {
                eids: [],
              },
            },
            bids: [],
          },
        ],
        bidsReceived: [],
        noBids: [],
        timeoutBids: [],
      };

      const bidWonEvent = {
        auctionId: "auction-complete",
        bidderCode: "bidder1",
        requestId: "bid-1",
        adUnitCode: "ad-unit-1",
        cpm: 1.5,
      };

      await analytics.trackAuctionEnd(auctionEndEvent);
      await analytics.trackBidWon(bidWonEvent);
      await jest.runAllTimersAsync();

      expect(mockOptableInstance.witness).toHaveBeenCalledWith(
        "optable.prebid.auction",
        expect.objectContaining({
          auctionId: "auction-complete",
          tenant: "test-tenant",
          missed: false,
          bidWon: [expect.objectContaining({ adUnitCode: "ad-unit-1", bidderCode: "bidder1" })],
        })
      );
    });

    it("should mark bid won as missed when specified", async () => {
      const auctionEndEvent = {
        auctionId: "auction-missed-bid",
        timeout: 3000,
        bidderRequests: [
          {
            bidderCode: "bidder1",
            bidderRequestId: "req-1",
            ortb2: {
              site: { domain: "example.com" },
              user: {
                eids: [],
              },
            },
            bids: [],
          },
        ],
        bidsReceived: [],
        noBids: [],
        timeoutBids: [],
      };

      const bidWonEvent = {
        auctionId: "auction-missed-bid",
        bidderCode: "bidder1",
        requestId: "bid-1",
        adUnitCode: "ad-unit-1",
        cpm: 1.5,
      };

      await analytics.trackAuctionEnd(auctionEndEvent);
      await analytics.trackBidWon(bidWonEvent, true);
      await jest.runAllTimersAsync();

      expect(mockOptableInstance.witness).toHaveBeenCalledWith(
        "optable.prebid.auction",
        expect.objectContaining({
          missed: true,
          optableLoaded: false,
        })
      );
    });

    it("should accumulate multiple bidWon events and emit one witness with an array", async () => {
      const auctionId = "auction-multi-unit";
      const auctionEndEvent = {
        auctionId,
        timeout: 3000,
        bidderRequests: [
          {
            bidderCode: "appnexus",
            bidderRequestId: "req-1",
            ortb2: {
              site: { domain: "example.com" },
              user: { eids: [] },
            },
            bids: [],
          },
        ],
        bidsReceived: [],
        noBids: [],
        timeoutBids: [],
      };

      await analytics.trackAuctionEnd(auctionEndEvent);
      await analytics.trackBidWon({ auctionId, bidderCode: "appnexus", adUnitCode: "div-test-1", cpm: 5.0 });
      await analytics.trackBidWon({ auctionId, bidderCode: "appnexus", adUnitCode: "div-test-2", cpm: 5.0 });
      await jest.runAllTimersAsync();

      expect(mockOptableInstance.witness).toHaveBeenCalledTimes(1);
      const [, properties] = (mockOptableInstance.witness as jest.Mock).mock.calls[0];
      expect(properties.bidWon).toHaveLength(2);
      expect(properties.bidWon).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ adUnitCode: "div-test-1" }),
          expect.objectContaining({ adUnitCode: "div-test-2" }),
        ])
      );
    });

    it("should emit bidWon:[] and bidWonAt:null when no bidWon events arrive", async () => {
      const auctionEndEvent = {
        auctionId: "auction-no-bidwon",
        timeout: 3000,
        bidderRequests: [
          {
            bidderCode: "bidder1",
            bidderRequestId: "req-1",
            ortb2: {
              site: { domain: "example.com" },
              user: { eids: [] },
            },
            bids: [],
          },
        ],
        bidsReceived: [],
        noBids: [],
        timeoutBids: [],
      };

      await analytics.trackAuctionEnd(auctionEndEvent);
      await jest.runAllTimersAsync();

      expect(mockOptableInstance.witness).toHaveBeenCalledWith(
        "optable.prebid.auction",
        expect.objectContaining({ bidWon: [], bidWonAt: null })
      );
    });

    it("should delete the auction from the map after the timeout fires", async () => {
      const auctionId = "auction-cleanup";
      const auctionEndEvent = {
        auctionId,
        timeout: 3000,
        bidderRequests: [
          {
            bidderCode: "bidder1",
            bidderRequestId: "req-1",
            ortb2: {
              site: { domain: "example.com" },
              user: { eids: [] },
            },
            bids: [],
          },
        ],
        bidsReceived: [],
        noBids: [],
        timeoutBids: [],
      };

      await analytics.trackAuctionEnd(auctionEndEvent);
      expect(analytics["auctions"].has(auctionId)).toBe(true);
      await jest.runAllTimersAsync();
      expect(analytics["auctions"].has(auctionId)).toBe(false);
    });
  });

  describe("log", () => {
    it("should not log when debug is false", () => {
      const consoleSpy = jest.spyOn(console, "log");
      analytics = new OptablePrebidAnalytics(mockOptableInstance, {
        debug: false,
      });

      analytics.log("test message", { data: "value" });

      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it("should log when debug is true", () => {
      const consoleSpy = jest.spyOn(console, "log");
      analytics = new OptablePrebidAnalytics(mockOptableInstance, {
        debug: true,
      });

      analytics.log("test message", { data: "value" });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.any(String),
        "test message",
        { data: "value" }
      );
      consoleSpy.mockRestore();
    });
  });

  describe("sendToWitnessAPI", () => {
    beforeEach(() => {
      analytics = new OptablePrebidAnalytics(mockOptableInstance, {
        analytics: true,
        samplingRate: 1,
      });
    });

    it("should not send when analytics is disabled", async () => {
      analytics = new OptablePrebidAnalytics(mockOptableInstance, {
        analytics: false,
      });

      const result = await analytics.sendToWitnessAPI("test.event", { prop: "value" });

      expect(result).toEqual({
        disabled: true,
        eventName: "test.event",
        properties: { prop: "value" },
      });
      expect(mockOptableInstance.witness).not.toHaveBeenCalled();
    });

    it("should not send when sampling returns false", async () => {
      analytics = new OptablePrebidAnalytics(mockOptableInstance, {
        analytics: true,
        samplingRate: 0,
      });

      const result = await analytics.sendToWitnessAPI("test.event", { prop: "value" });

      expect(result).toEqual({
        disabled: true,
        eventName: "test.event",
        properties: { prop: "value" },
      });
      expect(mockOptableInstance.witness).not.toHaveBeenCalled();
    });

    it("should send to witness API when enabled and sampled", async () => {
      const result = await analytics.sendToWitnessAPI("test.event", { prop: "value" });

      expect(result).toEqual({
        disabled: false,
        eventName: "test.event",
        properties: { prop: "value" },
      });
      expect(mockOptableInstance.witness).toHaveBeenCalledWith("test.event", { prop: "value" });
    });

    it("should handle errors from witness API", async () => {
      const error = new Error("Witness API error");
      mockOptableInstance.witness = jest.fn().mockRejectedValue(error);

      await expect(analytics.sendToWitnessAPI("test.event", { prop: "value" })).rejects.toThrow("Witness API error");
    });
  });

  describe("cleanupOldAuctions", () => {
    beforeEach(() => {
      analytics = new OptablePrebidAnalytics(mockOptableInstance);
    });

    it("should remove oldest auction when size exceeds maxAuctionDataSize", async () => {
      // Add 51 auctions (max is 50)
      for (let i = 0; i < 51; i++) {
        const event = {
          auctionId: `auction-${i}`,
          timeout: 3000,
          bidderRequests: [
            {
              bidderCode: "bidder1",
              bidderRequestId: "req-1",
              ortb2: {
                site: { domain: "example.com" },
                user: {
                  eids: [],
                },
              },
              bids: [],
            },
          ],
          bidsReceived: [],
          noBids: [],
          timeoutBids: [],
        };
        await analytics.trackAuctionEnd(event);
      }

      // First auction should be removed
      expect(analytics["auctions"].has("auction-0")).toBe(false);
      // Last auction should still exist
      expect(analytics["auctions"].has("auction-50")).toBe(true);
      // Size should be at max
      expect(analytics["auctions"].size).toBe(50);
    });
  });

  describe("clearData", () => {
    beforeEach(() => {
      analytics = new OptablePrebidAnalytics(mockOptableInstance);
    });

    it("should clear all auction data", async () => {
      // Add some auctions
      const event = {
        auctionId: "auction-test",
        timeout: 3000,
        bidderRequests: [
          {
            bidderCode: "bidder1",
            bidderRequestId: "req-1",
            ortb2: {
              site: { domain: "example.com" },
              user: {
                eids: [],
              },
            },
            bids: [],
          },
        ],
        bidsReceived: [],
        noBids: [],
        timeoutBids: [],
      };
      await analytics.trackAuctionEnd(event);

      expect(analytics["auctions"].size).toBe(1);

      analytics.clearData();

      expect(analytics["auctions"].size).toBe(0);
    });

    it("should clear missedAuctionIds", () => {
      // Add some missed auction IDs
      analytics["missedAuctionIds"].add("auction-1");
      analytics["missedAuctionIds"].add("auction-2");

      expect(analytics["missedAuctionIds"].size).toBe(2);

      analytics.clearData();

      expect(analytics["missedAuctionIds"].size).toBe(0);
    });
  });

  describe("hookIntoPrebid", () => {
    it("should return false when pbjs is undefined", () => {
      analytics = new OptablePrebidAnalytics(mockOptableInstance);

      const result = analytics.hookIntoPrebid(undefined);

      expect(result).toBe(false);
    });

    it("should hook into prebid when onEvent is available", () => {
      analytics = new OptablePrebidAnalytics(mockOptableInstance);
      const mockPbjs = {
        onEvent: jest.fn(),
        getEvents: jest.fn().mockReturnValue([]),
      };

      const result = analytics.hookIntoPrebid(mockPbjs as any);

      expect(result).toBe(true);
      expect(mockPbjs.onEvent).toHaveBeenCalledTimes(3);
      expect(mockPbjs.onEvent).toHaveBeenCalledWith("bidTimeout", expect.any(Function));
      expect(mockPbjs.onEvent).toHaveBeenCalledWith("auctionEnd", expect.any(Function));
      expect(mockPbjs.onEvent).toHaveBeenCalledWith("bidWon", expect.any(Function));
    });

    it("should queue hooks when onEvent is not available", () => {
      analytics = new OptablePrebidAnalytics(mockOptableInstance);
      const mockPbjs = {
        que: [],
      };

      const result = analytics.hookIntoPrebid(mockPbjs as any);

      expect(result).toBe(true);
      expect(mockPbjs.que).toHaveLength(1);
    });
  });

  describe("trackAuctionEnd - advanced scenarios", () => {
    beforeEach(() => {
      analytics = new OptablePrebidAnalytics(mockOptableInstance);
    });

    it("should handle bidsReceived and update bid status", async () => {
      const event = {
        auctionId: "auction-with-bids",
        timeout: 3000,
        bidderRequests: [
          {
            bidderCode: "bidder1",
            bidderRequestId: "req-1",
            ortb2: {
              site: { domain: "example.com" },
              user: {
                eids: [],
              },
            },
            bids: [
              {
                bidId: "bid-1",
                adUnitCode: "ad-unit-1",
                adUnitId: "ad-id-1",
                transactionId: "trans-1",
                src: "client",
              },
            ],
          },
        ],
        bidsReceived: [
          {
            requestId: "bid-1",
            cpm: 1.5,
            width: 300,
            height: 250,
            currency: "USD",
            adUnitCode: "ad-unit-1",
          },
        ],
        noBids: [],
      };

      await analytics.trackAuctionEnd(event);

      const storedAuction = analytics["auctions"].get("auction-with-bids");
      expect(storedAuction).toBeDefined();

      const payload = await analytics.toWitness(storedAuction!.auctionEnd, []);
      const bid = payload.bidderRequests[0].bids[0];
      expect(bid.status).toBe("RECEIVED");
      expect(bid.cpm).toBe(1.5);
      expect(bid.size).toBe("300x250");
      expect(bid.currency).toBe("USD");
      expect(payload.bidderRequests[0].status).toBe("RECEIVED");
    });

    it("should extract splitTestAssignment from bidsReceived", async () => {
      const event = {
        auctionId: "auction-split-test",
        timeout: 3000,
        bidderRequests: [
          {
            bidderCode: "bidder1",
            bidderRequestId: "req-1",
            ortb2: {
              site: { domain: "example.com" },
              user: {
                eids: [
                  {
                    inserter: "optable.co",
                    matcher: "matcher1",
                    source: "source1",
                  },
                ],
              },
            },
            bids: [
              {
                bidId: "bid-1",
                adUnitCode: "ad-unit-1",
                adUnitId: "ad-id-1",
                transactionId: "trans-1",
                src: "client",
              },
            ],
          },
        ],
        bidsReceived: [
          {
            requestId: "bid-1",
            cpm: 1.5,
            width: 300,
            height: 250,
            currency: "USD",
            adUnitCode: "ad-unit-1",
            ortb2Imp: {
              ext: {
                optable: {
                  splitTestAssignment: "treatment",
                },
              },
            },
          },
        ],
        noBids: [],
        timeoutBids: [],
      };

      await analytics.trackAuctionEnd(event);

      // Get the stored auction and check the bid has splitTestAssignment
      const storedAuction = analytics["auctions"].get("auction-split-test");
      expect(storedAuction).toBeDefined();

      // The splitTestAssignment should be extracted and merged in toWitness
      const payload = await analytics.toWitness(storedAuction.auctionEnd, []);
      expect(payload.bidderRequests[0].bids[0].splitTestAssignment).toBe("treatment");
    });

    it("should handle missing splitTestAssignment gracefully", async () => {
      const event = {
        auctionId: "auction-no-split-test",
        timeout: 3000,
        bidderRequests: [
          {
            bidderCode: "bidder1",
            bidderRequestId: "req-1",
            ortb2: {
              site: { domain: "example.com" },
              user: {
                eids: [],
              },
            },
            bids: [
              {
                bidId: "bid-1",
                adUnitCode: "ad-unit-1",
                adUnitId: "ad-id-1",
                transactionId: "trans-1",
                src: "client",
              },
            ],
          },
        ],
        bidsReceived: [
          {
            requestId: "bid-1",
            cpm: 1.5,
            width: 300,
            height: 250,
            currency: "USD",
            adUnitCode: "ad-unit-1",
            // No ortb2Imp field
          },
        ],
        noBids: [],
        timeoutBids: [],
      };

      await analytics.trackAuctionEnd(event);

      // Should not throw error and splitTestAssignment should be undefined
      const storedAuction = analytics["auctions"].get("auction-no-split-test");
      expect(storedAuction).toBeDefined();

      const payload = await analytics.toWitness(storedAuction.auctionEnd, []);
      expect(payload.bidderRequests[0].bids[0].splitTestAssignment).toBeUndefined();
    });

    it("should handle noBids and update status", async () => {
      const event = {
        auctionId: "auction-no-bids",
        timeout: 3000,
        bidderRequests: [
          {
            bidderCode: "bidder1",
            bidderRequestId: "req-1",
            ortb2: {
              site: { domain: "example.com" },
              user: { eids: [] },
            },
            bids: [],
          },
        ],
        bidsReceived: [],
        noBids: [{ bidderRequestId: "req-1" }],
      };

      await analytics.trackAuctionEnd(event);

      const storedAuction = analytics["auctions"].get("auction-no-bids");
      expect(storedAuction).toBeDefined();

      const payload = await analytics.toWitness(storedAuction!.auctionEnd, []);
      expect(payload.bidderRequests[0].status).toBe("NO_BID");
    });

    it("should handle timeoutBids via pendingTimeoutBids and update status in toWitness", async () => {
      // Simulate the bidTimeout event arriving before auctionEnd (the real Prebid flow)
      analytics["pendingTimeoutBids"].set("auction-timeout", [{ bidderRequestId: "req-1", auctionId: "auction-timeout" }]);

      const event = {
        auctionId: "auction-timeout",
        timeout: 3000,
        bidderRequests: [
          {
            bidderCode: "bidder1",
            bidderRequestId: "req-1",
            ortb2: {
              site: { domain: "example.com" },
              user: { eids: [] },
            },
            bids: [],
          },
        ],
        bidsReceived: [],
        noBids: [],
      };

      await analytics.trackAuctionEnd(event);

      // pendingTimeoutBids should be cleaned up after trackAuctionEnd
      expect(analytics["pendingTimeoutBids"].has("auction-timeout")).toBe(false);

      // timeoutBids should be stored on the AuctionItem
      const storedAuction = analytics["auctions"].get("auction-timeout");
      expect(storedAuction!.timeoutBids).toHaveLength(1);

      // toWitness should mark the bidder request as TIMEOUT
      const payload = await analytics.toWitness(storedAuction!.auctionEnd, []);
      expect(payload.bidderRequests[0].status).toBe("TIMEOUT");
    });
  });

  describe("toWitness - advanced scenarios", () => {
    beforeEach(() => {
      analytics = new OptablePrebidAnalytics(mockOptableInstance, {
        tenant: "test-tenant",
      });
    });

    it("should handle multiple bidder requests", async () => {
      const auctionEndEvent = {
        auctionId: "auction-multi",
        bidderRequests: [
          {
            bidderCode: "bidder1",
            bidderRequestId: "req-1",
            ortb2: {
              site: { domain: "example.com" },
              user: {
                eids: [{ inserter: "optable.co", matcher: "matcher1", source: "source1" }],
              },
            },
            bids: [],
          },
          {
            bidderCode: "bidder2",
            bidderRequestId: "req-2",
            ortb2: {
              site: { domain: "example.com" },
              user: {
                eids: [{ inserter: "optable.co", matcher: "matcher2", source: "source2" }],
              },
            },
            bids: [],
          },
        ],
        bidsReceived: [],
        noBids: [],
        timeoutBids: [],
      };

      const bidWonEvent = {
        bidderCode: "bidder1",
        adUnitCode: "ad-unit-1",
        cpm: 1.5,
      };

      const result = await analytics.toWitness(auctionEndEvent, [bidWonEvent]);

      expect(result.totalRequests).toBe(2);
      expect(result.bidderRequests).toHaveLength(2);
      expect(result.optableMatchers).toContain("matcher1");
      expect(result.optableMatchers).toContain("matcher2");
    });

    it("should handle mixed EIDs (optable and non-optable)", async () => {
      const auctionEndEvent = {
        auctionId: "auction-mixed-eids",
        bidderRequests: [
          {
            bidderCode: "bidder1",
            bidderRequestId: "req-1",
            ortb2: {
              site: { domain: "example.com" },
              user: {
                eids: [
                  { inserter: "optable.co", matcher: "matcher1", source: "source1" },
                  { inserter: "other.com", matcher: "other-matcher", source: "other-source" },
                ],
              },
            },
            bids: [],
          },
        ],
        bidsReceived: [],
        noBids: [],
        timeoutBids: [],
      };

      const bidWonEvent = {
        bidderCode: "bidder1",
        adUnitCode: "ad-unit-1",
        cpm: 1.5,
      };

      const result = await analytics.toWitness(auctionEndEvent, [bidWonEvent]);

      // Should only include optable EIDs
      expect(result.optableMatchers).toEqual(["matcher1"]);
      expect(result.optableMatchers).not.toContain("other-matcher");
    });

    it("should call custom analytics when available", async () => {
      const customData = { customProp: "customValue" };
      (window as any).optable = {
        customAnalytics: jest.fn().mockResolvedValue(customData),
      };

      const auctionEndEvent = {
        auctionId: "auction-custom",
        bidderRequests: [
          {
            bidderCode: "bidder1",
            bidderRequestId: "req-1",
            ortb2: {
              site: { domain: "example.com" },
              user: {
                eids: [],
              },
            },
            bids: [],
          },
        ],
        bidsReceived: [],
        noBids: [],
        timeoutBids: [],
      };

      const bidWonEvent = {
        bidderCode: "bidder1",
        adUnitCode: "ad-unit-1",
        cpm: 1.5,
      };

      const result = await analytics.toWitness(auctionEndEvent, [bidWonEvent]);

      expect(window.optable.customAnalytics).toHaveBeenCalled();
      expect(result).toMatchObject(customData);

      delete (window as any).optable;
    });
  });

  describe("visibilitychange flush", () => {
    let sendBeaconMock: jest.Mock;
    let mockOptableWithDcn: OptableSDK;

    const fireHidden = () => {
      Object.defineProperty(document, "visibilityState", { value: "hidden", configurable: true });
      document.dispatchEvent(new Event("visibilitychange"));
    };

    beforeEach(() => {
      Object.defineProperty(document, "visibilityState", { value: "visible", configurable: true });
      sendBeaconMock = jest.fn().mockReturnValue(true);
      (navigator as any).sendBeacon = sendBeaconMock;

      mockOptableWithDcn = {
        witness: jest.fn().mockResolvedValue(undefined),
        dcn: {
          host: "dcn.example.com",
          cookies: false,
          sessionID: "test-session-id",
          consent: {},
        },
      } as any;

      analytics = new OptablePrebidAnalytics(mockOptableWithDcn, {
        analytics: true,
        tenant: "test-tenant",
      });
    });

    afterEach(() => {
      Object.defineProperty(document, "visibilityState", { value: "visible", configurable: true });
    });

    it("should flush pending auctions via sendBeacon when page becomes hidden", async () => {
      const event = {
        auctionId: "auction-unload",
        timeout: 3000,
        bidderRequests: [
          {
            bidderCode: "bidder1",
            bidderRequestId: "req-1",
            ortb2: { site: { domain: "example.com" }, user: { eids: [] } },
            bids: [],
          },
        ],
        bidsReceived: [],
        noBids: [],
      };

      await analytics.trackAuctionEnd(event);

      // Confirm a timeout is pending
      const storedAuction = analytics["auctions"].get("auction-unload");
      expect(storedAuction!.auctionEndTimeoutId).not.toBeNull();

      fireHidden();

      // Allow the toWitness promise to resolve
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(sendBeaconMock).toHaveBeenCalledTimes(1);
      const [url, blob] = sendBeaconMock.mock.calls[0];
      expect(url).toContain("/witness");
      const body = JSON.parse(await new Response(blob).text());
      expect(body.event).toBe("optable.prebid.auction");
      expect(body.properties.auctionId).toBe("auction-unload");
      expect(body.properties.bidWonAt).toBeNull();
    });

    it("should not flush when visibilityState is visible", async () => {
      const event = {
        auctionId: "auction-visible",
        timeout: 3000,
        bidderRequests: [
          {
            bidderCode: "bidder1",
            bidderRequestId: "req-1",
            ortb2: { site: { domain: "example.com" }, user: { eids: [] } },
            bids: [],
          },
        ],
        bidsReceived: [],
        noBids: [],
      };

      await analytics.trackAuctionEnd(event);

      // Fire with visible state (e.g. tab becomes foreground)
      Object.defineProperty(document, "visibilityState", { value: "visible", configurable: true });
      document.dispatchEvent(new Event("visibilitychange"));
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(sendBeaconMock).not.toHaveBeenCalled();
    });

    it("should not flush when analytics is disabled (analytics: false)", async () => {
      const disabledAnalytics = new OptablePrebidAnalytics(mockOptableWithDcn, {
        analytics: false,
        tenant: "test-tenant",
      });

      const event = {
        auctionId: "auction-disabled",
        timeout: 3000,
        bidderRequests: [
          {
            bidderCode: "bidder1",
            bidderRequestId: "req-1",
            ortb2: { site: { domain: "example.com" }, user: { eids: [] } },
            bids: [],
          },
        ],
        bidsReceived: [],
        noBids: [],
      };

      await disabledAnalytics.trackAuctionEnd(event);
      fireHidden();
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(sendBeaconMock).not.toHaveBeenCalled();
      document.removeEventListener("visibilitychange", (disabledAnalytics as any).handleVisibilityChange);
    });

    it("should not flush auctions in sampling holdout (sampled=false)", async () => {
      // analytics: true but samplingRate: 0 → shouldSample() returns false → sampled=false
      const holdoutAnalytics = new OptablePrebidAnalytics(mockOptableWithDcn, {
        analytics: true,
        samplingRate: 0,
        tenant: "test-tenant",
      });

      const event = {
        auctionId: "auction-holdout",
        timeout: 3000,
        bidderRequests: [
          {
            bidderCode: "bidder1",
            bidderRequestId: "req-1",
            ortb2: { site: { domain: "example.com" }, user: { eids: [] } },
            bids: [],
          },
        ],
        bidsReceived: [],
        noBids: [],
      };

      await holdoutAnalytics.trackAuctionEnd(event);

      const storedAuction = holdoutAnalytics["auctions"].get("auction-holdout");
      expect(storedAuction!.sampled).toBe(false);

      fireHidden();
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(sendBeaconMock).not.toHaveBeenCalled();
      document.removeEventListener("visibilitychange", (holdoutAnalytics as any).handleVisibilityChange);
    });

    it("should not flush auctions that have no pending timeout", async () => {
      jest.useFakeTimers();

      const auctionEndEvent = {
        auctionId: "auction-already-sent",
        timeout: 3000,
        bidderRequests: [
          {
            bidderCode: "bidder1",
            bidderRequestId: "req-1",
            ortb2: { site: { domain: "example.com" }, user: { eids: [] } },
            bids: [],
          },
        ],
        bidsReceived: [],
        noBids: [],
      };
      const bidWonEvent = {
        auctionId: "auction-already-sent",
        bidderCode: "bidder1",
        requestId: "bid-1",
        adUnitCode: "ad-unit-1",
        cpm: 1.5,
      };

      await analytics.trackAuctionEnd(auctionEndEvent);
      await analytics.trackBidWon(bidWonEvent);

      // Let the bidWinTimeout fire — sends via witness and deletes the auction
      await jest.runAllTimersAsync();
      expect(mockOptableWithDcn.witness).toHaveBeenCalledTimes(1);

      jest.useRealTimers();

      // No auctions remain, so visibilitychange should not trigger sendBeacon
      fireHidden();
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(sendBeaconMock).not.toHaveBeenCalled();
    });
  });

  describe("setHooks", () => {
    beforeEach(() => {
      analytics = new OptablePrebidAnalytics(mockOptableInstance, {
        debug: true,
      });
    });

    it("should track auctions that started but not finished as missed", () => {
      const mockPbjs = {
        getEvents: jest.fn().mockReturnValue([
          {
            eventType: "auctionInit",
            args: {
              auctionId: "incomplete-auction",
            },
          },
        ]),
        onEvent: jest.fn(),
      };

      analytics["setHooks"](mockPbjs);

      // Auction should be in missedAuctionIds since it started but hasn't ended
      expect(analytics["missedAuctionIds"].has("incomplete-auction")).toBe(true);
    });

    it("should not track auctions that completed before hooks as missed", () => {
      const mockPbjs = {
        getEvents: jest.fn().mockReturnValue([
          {
            eventType: "auctionInit",
            args: {
              auctionId: "complete-auction",
            },
          },
          {
            eventType: "auctionEnd",
            args: {
              auctionId: "complete-auction",
              timeout: 3000,
              bidderRequests: [
                {
                  bidderCode: "bidder1",
                  bidderRequestId: "req-1",
                  ortb2: {
                    site: { domain: "example.com" },
                    user: {
                      eids: [],
                    },
                  },
                  bids: [],
                },
              ],
              bidsReceived: [],
              noBids: [],
              timeoutBids: [],
            },
          },
        ]),
        onEvent: jest.fn(),
      };

      analytics["setHooks"](mockPbjs);

      // Auction should NOT be in missedAuctionIds since it both started and ended
      expect(analytics["missedAuctionIds"].has("complete-auction")).toBe(false);
    });

    it("should mark live auction as missed when it was in missedAuctionIds", () => {
      const mockPbjs = {
        getEvents: jest.fn().mockReturnValue([
          {
            eventType: "auctionInit",
            args: {
              auctionId: "late-auction",
            },
          },
        ]),
        onEvent: jest.fn(),
      };

      analytics["setHooks"](mockPbjs);

      // Verify it's tracked as missed initially
      expect(analytics["missedAuctionIds"].has("late-auction")).toBe(true);

      // Now trigger the live auctionEnd event
      const auctionEndCallback = mockPbjs.onEvent.mock.calls.find((call) => call[0] === "auctionEnd")[1];
      auctionEndCallback({
        auctionId: "late-auction",
        timeout: 3000,
        bidderRequests: [
          {
            bidderCode: "bidder1",
            bidderRequestId: "req-1",
            ortb2: {
              site: { domain: "example.com" },
              user: {
                eids: [],
              },
            },
            bids: [],
          },
        ],
        bidsReceived: [],
        noBids: [],
        timeoutBids: [],
      });

      // Should be removed from missedAuctionIds
      expect(analytics["missedAuctionIds"].has("late-auction")).toBe(false);

      // And auction should be marked as missed
      const auction = analytics["auctions"].get("late-auction");
      expect(auction?.missed).toBe(true);
    });

    describe("Comprehensive missed auction scenarios", () => {
      it("Scenario 1: auctionInit + auctionEnd both before load => missed", () => {
        const mockPbjs = {
          getEvents: jest.fn().mockReturnValue([
            {
              eventType: "auctionInit",
              args: { auctionId: "scenario-1" },
            },
            {
              eventType: "auctionEnd",
              args: {
                auctionId: "scenario-1",
                timeout: 3000,
                bidderRequests: [
                  {
                    bidderCode: "bidder1",
                    bidderRequestId: "req-1",
                    ortb2: {
                      site: { domain: "example.com" },
                      user: { eids: [] },
                    },
                    bids: [],
                  },
                ],
                bidsReceived: [],
                noBids: [],
                timeoutBids: [],
              },
            },
          ]),
          onEvent: jest.fn(),
        };

        analytics["setHooks"](mockPbjs);

        // Should NOT be in missedAuctionIds (was removed after seeing auctionEnd)
        expect(analytics["missedAuctionIds"].has("scenario-1")).toBe(false);

        // Auction should be tracked and marked as missed
        const auction = analytics["auctions"].get("scenario-1");
        expect(auction).toBeDefined();
        expect(auction?.missed).toBe(true);
      });

      it("Scenario 2: auctionInit before load + auctionEnd after load => missed", () => {
        const mockPbjs = {
          getEvents: jest.fn().mockReturnValue([
            {
              eventType: "auctionInit",
              args: { auctionId: "scenario-2" },
            },
            // No auctionEnd in past events
          ]),
          onEvent: jest.fn(),
        };

        analytics["setHooks"](mockPbjs);

        // Should be in missedAuctionIds (started before load, not ended yet)
        expect(analytics["missedAuctionIds"].has("scenario-2")).toBe(true);

        // Now trigger live auctionEnd
        const auctionEndCallback = mockPbjs.onEvent.mock.calls.find((call) => call[0] === "auctionEnd")[1];
        auctionEndCallback({
          auctionId: "scenario-2",
          timeout: 3000,
          bidderRequests: [
            {
              bidderCode: "bidder1",
              bidderRequestId: "req-1",
              ortb2: {
                site: { domain: "example.com" },
                user: { eids: [] },
              },
              bids: [],
            },
          ],
          bidsReceived: [],
          noBids: [],
          timeoutBids: [],
        });

        // Should be removed from missedAuctionIds
        expect(analytics["missedAuctionIds"].has("scenario-2")).toBe(false);

        // Auction should be marked as missed
        const auction = analytics["auctions"].get("scenario-2");
        expect(auction).toBeDefined();
        expect(auction?.missed).toBe(true);
      });

      it("Scenario 3: auctionInit + auctionEnd both after load => not missed", () => {
        const mockPbjs = {
          getEvents: jest.fn().mockReturnValue([
            // No past events for this auction
          ]),
          onEvent: jest.fn(),
        };

        analytics["setHooks"](mockPbjs);

        // Should NOT be in missedAuctionIds
        expect(analytics["missedAuctionIds"].has("scenario-3")).toBe(false);

        // Now trigger live auctionEnd
        const auctionEndCallback = mockPbjs.onEvent.mock.calls.find((call) => call[0] === "auctionEnd")[1];
        auctionEndCallback({
          auctionId: "scenario-3",
          timeout: 3000,
          bidderRequests: [
            {
              bidderCode: "bidder1",
              bidderRequestId: "req-1",
              ortb2: {
                site: { domain: "example.com" },
                user: { eids: [] },
              },
              bids: [],
            },
          ],
          bidsReceived: [],
          noBids: [],
          timeoutBids: [],
        });

        // Should still NOT be in missedAuctionIds
        expect(analytics["missedAuctionIds"].has("scenario-3")).toBe(false);

        // Auction should be marked as NOT missed
        const auction = analytics["auctions"].get("scenario-3");
        expect(auction).toBeDefined();
        expect(auction?.missed).toBe(false);
      });

      it("Scenario with bidWon: auctionEnd + bidWon both in past => accumulates bidWon correctly", async () => {
        jest.useFakeTimers();

        const witnessspy = jest.fn().mockResolvedValue(undefined);
        const testInstance = {
          witness: witnessspy,
        } as any;

        const testAnalytics = new OptablePrebidAnalytics(testInstance, {
          analytics: true,
          tenant: "test-tenant",
          debug: true,
        });

        const mockPbjs = {
          getEvents: jest.fn().mockReturnValue([
            {
              eventType: "auctionInit",
              args: { auctionId: "scenario-bidwon" },
            },
            {
              eventType: "auctionEnd",
              args: {
                auctionId: "scenario-bidwon",
                timeout: 3000,
                bidderRequests: [
                  {
                    bidderCode: "bidder1",
                    bidderRequestId: "req-1",
                    ortb2: {
                      site: { domain: "example.com" },
                      user: { eids: [] },
                    },
                    bids: [
                      {
                        bidId: "bid-1",
                        adUnitCode: "ad-unit-1",
                        transactionId: "trans-1",
                      },
                    ],
                  },
                ],
                bidsReceived: [],
                noBids: [],
                timeoutBids: [],
              },
            },
            {
              eventType: "bidWon",
              args: {
                auctionId: "scenario-bidwon",
                bidderCode: "bidder1",
                requestId: "bid-1",
                adUnitCode: "ad-unit-1",
                cpm: 2.5,
              },
            },
          ]),
          onEvent: jest.fn(),
        };

        testAnalytics["setHooks"](mockPbjs);

        // Auction should be tracked
        const auction = testAnalytics["auctions"].get("scenario-bidwon");
        expect(auction).toBeDefined();
        expect(auction?.missed).toBe(true);
        expect(auction?.bidWonEvents).toHaveLength(1);
        expect(auction?.bidWonEvents[0].cpm).toBe(2.5);

        // Wait for timeout and check witness call
        await jest.runAllTimersAsync();

        expect(witnessspy).toHaveBeenCalledWith(
          "optable.prebid.auction",
          expect.objectContaining({
            auctionId: "scenario-bidwon",
            missed: true,
            bidWon: [
              expect.objectContaining({
                bidderCode: "bidder1",
                cpm: 2.5,
              }),
            ],
          })
        );

        jest.useRealTimers();
      });
    });

    it("should process missed bidWon events", async () => {
      jest.useFakeTimers();

      const witnessspy = jest.fn().mockResolvedValue(undefined);
      const testInstance = {
        witness: witnessspy,
      } as any;

      analytics = new OptablePrebidAnalytics(testInstance, {
        analytics: true,
        tenant: "test-tenant",
        debug: true,
      });

      // First add an auction
      const auctionEvent = {
        auctionId: "auction-for-missed-bid",
        timeout: 3000,
        bidderRequests: [
          {
            bidderCode: "bidder1",
            bidderRequestId: "req-1",
            ortb2: {
              site: { domain: "example.com" },
              user: {
                eids: [],
              },
            },
            bids: [],
          },
        ],
        bidsReceived: [],
        noBids: [],
        timeoutBids: [],
      };
      await analytics.trackAuctionEnd(auctionEvent);

      const mockPbjs = {
        getEvents: jest.fn().mockReturnValue([
          {
            eventType: "bidWon",
            args: {
              auctionId: "auction-for-missed-bid",
              bidderCode: "bidder1",
              requestId: "bid-1",
              adUnitCode: "ad-unit-1",
              cpm: 1.5,
            },
          },
        ]),
        onEvent: jest.fn(),
      };

      analytics["setHooks"](mockPbjs);
      await jest.runAllTimersAsync();
      jest.useRealTimers();

      expect(witnessspy).toHaveBeenCalledWith(
        "optable.prebid.auction",
        expect.objectContaining({
          auctionId: "auction-for-missed-bid",
          missed: true,
        })
      );
    });

    it("should register event callbacks", () => {
      const mockPbjs = {
        getEvents: jest.fn().mockReturnValue([]),
        onEvent: jest.fn(),
      };

      analytics["setHooks"](mockPbjs);

      expect(mockPbjs.onEvent).toHaveBeenCalledWith("bidTimeout", expect.any(Function));
      expect(mockPbjs.onEvent).toHaveBeenCalledWith("auctionEnd", expect.any(Function));
      expect(mockPbjs.onEvent).toHaveBeenCalledWith("bidWon", expect.any(Function));
    });

    it("should accumulate timeout bids into pendingTimeoutBids via live bidTimeout listener", () => {
      const capturedHandlers: Record<string, Function> = {};
      const mockPbjs = {
        getEvents: jest.fn().mockReturnValue([]),
        onEvent: jest.fn((event: string, handler: Function) => {
          capturedHandlers[event] = handler;
        }),
      };

      analytics["setHooks"](mockPbjs);

      // Simulate bidTimeout firing before auctionEnd
      capturedHandlers["bidTimeout"]([
        { auctionId: "auction-live-timeout", bidderRequestId: "req-1" },
        { auctionId: "auction-live-timeout", bidderRequestId: "req-2" },
      ]);

      expect(analytics["pendingTimeoutBids"].get("auction-live-timeout")).toHaveLength(2);
    });

    it("should replay missed bidTimeout events before processing missed auctionEnd", async () => {
      const mockPbjs = {
        getEvents: jest.fn().mockReturnValue([
          {
            eventType: "bidTimeout",
            args: [
              { auctionId: "auction-missed-timeout", bidderRequestId: "req-1" },
            ],
          },
          {
            eventType: "auctionEnd",
            args: {
              auctionId: "auction-missed-timeout",
              timeout: 3000,
              bidderRequests: [
                {
                  bidderCode: "bidder1",
                  bidderRequestId: "req-1",
                  ortb2: {
                    site: { domain: "example.com" },
                    user: { eids: [] },
                  },
                  bids: [],
                },
              ],
              bidsReceived: [],
              noBids: [],
            },
          },
        ]),
        onEvent: jest.fn(),
      };

      analytics["setHooks"](mockPbjs);

      // Wait for async trackAuctionEnd to complete
      await new Promise((resolve) => setTimeout(resolve, 10));

      const storedAuction = analytics["auctions"].get("auction-missed-timeout");
      expect(storedAuction!.timeoutBids).toHaveLength(1);

      const payload = await analytics.toWitness(storedAuction!.auctionEnd, []);
      expect(payload.bidderRequests[0].status).toBe("TIMEOUT");
    });
  });

  describe("EID deduplication", () => {
    beforeEach(() => {
      analytics = new OptablePrebidAnalytics(mockOptableInstance, {
        tenant: "test-tenant",
      });
    });

    it("should deduplicate EIDs by source when both ext.eids and eids contain same source", async () => {
      const auctionEndEvent = {
        auctionId: "auction-dedup",
        bidderRequests: [
          {
            bidderCode: "bidder1",
            bidderRequestId: "req-1",
            ortb2: {
              site: { domain: "example.com" },
              user: {
                ext: {
                  eids: [{ inserter: "optable.co", matcher: "matcher1", source: "optable.co" }],
                },
                eids: [{ inserter: "optable.co", matcher: "matcher2", source: "optable.co" }],
              },
            },
            bids: [],
          },
        ],
        bidsReceived: [],
        noBids: [],
        timeoutBids: [],
      };

      const result = await analytics.toWitness(auctionEndEvent, []);

      // Should only have one source since they have the same source value
      expect(result.optableSources).toEqual(["optable.co"]);
      // The last occurrence (from eids, not ext.eids) should win due to deduplication
      expect(result.optableMatchers).toEqual(["matcher2"]);
    });

    it("should preserve EIDs with different sources from ext.eids and eids", async () => {
      const auctionEndEvent = {
        auctionId: "auction-no-dedup",
        bidderRequests: [
          {
            bidderCode: "bidder1",
            bidderRequestId: "req-1",
            ortb2: {
              site: { domain: "example.com" },
              user: {
                ext: {
                  eids: [{ inserter: "optable.co", matcher: "matcher1", source: "source1.optable.co" }],
                },
                eids: [{ inserter: "optable.co", matcher: "matcher2", source: "source2.optable.co" }],
              },
            },
            bids: [],
          },
        ],
        bidsReceived: [],
        noBids: [],
        timeoutBids: [],
      };

      const result = await analytics.toWitness(auctionEndEvent, []);

      // Should have both sources since they're different
      expect(result.optableSources).toHaveLength(2);
      expect(result.optableSources).toContain("source1.optable.co");
      expect(result.optableSources).toContain("source2.optable.co");
      expect(result.optableMatchers).toHaveLength(2);
      expect(result.optableMatchers).toContain("matcher1");
      expect(result.optableMatchers).toContain("matcher2");
    });

    it("should handle empty ext.eids and only use eids", async () => {
      const auctionEndEvent = {
        auctionId: "auction-only-eids",
        bidderRequests: [
          {
            bidderCode: "bidder1",
            bidderRequestId: "req-1",
            ortb2: {
              site: { domain: "example.com" },
              user: {
                ext: {
                  eids: [],
                },
                eids: [{ inserter: "optable.co", matcher: "matcher1", source: "source1" }],
              },
            },
            bids: [],
          },
        ],
        bidsReceived: [],
        noBids: [],
        timeoutBids: [],
      };

      const result = await analytics.toWitness(auctionEndEvent, []);

      expect(result.optableSources).toEqual(["source1"]);
      expect(result.optableMatchers).toEqual(["matcher1"]);
    });

    it("should handle missing ext.eids and only use eids", async () => {
      const auctionEndEvent = {
        auctionId: "auction-no-ext-eids",
        bidderRequests: [
          {
            bidderCode: "bidder1",
            bidderRequestId: "req-1",
            ortb2: {
              site: { domain: "example.com" },
              user: {
                eids: [{ inserter: "optable.co", matcher: "matcher1", source: "source1" }],
              },
            },
            bids: [],
          },
        ],
        bidsReceived: [],
        noBids: [],
        timeoutBids: [],
      };

      const result = await analytics.toWitness(auctionEndEvent, []);

      expect(result.optableSources).toEqual(["source1"]);
      expect(result.optableMatchers).toEqual(["matcher1"]);
    });

    it("should handle empty eids and only use ext.eids", async () => {
      const auctionEndEvent = {
        auctionId: "auction-only-ext-eids",
        bidderRequests: [
          {
            bidderCode: "bidder1",
            bidderRequestId: "req-1",
            ortb2: {
              site: { domain: "example.com" },
              user: {
                ext: {
                  eids: [{ inserter: "optable.co", matcher: "matcher1", source: "source1" }],
                },
                eids: [],
              },
            },
            bids: [],
          },
        ],
        bidsReceived: [],
        noBids: [],
        timeoutBids: [],
      };

      const result = await analytics.toWitness(auctionEndEvent, []);

      expect(result.optableSources).toEqual(["source1"]);
      expect(result.optableMatchers).toEqual(["matcher1"]);
    });

    it("should deduplicate multiple EIDs with same source across different locations", async () => {
      const auctionEndEvent = {
        auctionId: "auction-multi-dedup",
        bidderRequests: [
          {
            bidderCode: "bidder1",
            bidderRequestId: "req-1",
            ortb2: {
              site: { domain: "example.com" },
              user: {
                ext: {
                  eids: [
                    { inserter: "optable.co", matcher: "matcher1", source: "optable.co" },
                    { inserter: "other.co", matcher: "other1", source: "other.co" },
                  ],
                },
                eids: [
                  { inserter: "optable.co", matcher: "matcher2", source: "optable.co" },
                  { inserter: "other.co", matcher: "other2", source: "other.co" },
                ],
              },
            },
            bids: [],
          },
        ],
        bidsReceived: [],
        noBids: [],
        timeoutBids: [],
      };

      const result = await analytics.toWitness(auctionEndEvent, []);

      // Should only have one optable source and matcher due to deduplication
      expect(result.optableSources).toEqual(["optable.co"]);
      expect(result.optableMatchers).toEqual(["matcher2"]);
      // Non-optable EIDs should be filtered out
      expect(result.optableMatchers).not.toContain("other1");
      expect(result.optableMatchers).not.toContain("other2");
    });

    it("should handle trackAuctionEnd with duplicate EIDs in ext.eids and eids", async () => {
      const event = {
        auctionId: "auction-track-dedup",
        timeout: 3000,
        bidderRequests: [
          {
            bidderCode: "bidder1",
            bidderRequestId: "req-1",
            ortb2: {
              site: { domain: "example.com" },
              user: {
                ext: {
                  eids: [{ inserter: "optable.co", matcher: "matcher1", source: "optable.co" }],
                },
                eids: [{ inserter: "optable.co", matcher: "matcher2", source: "optable.co" }],
              },
            },
            bids: [],
          },
        ],
        bidsReceived: [],
        noBids: [],
        timeoutBids: [],
      };

      await analytics.trackAuctionEnd(event);

      const storedAuction = analytics["auctions"].get("auction-track-dedup");
      expect(storedAuction).toBeDefined();

      const payload = await analytics.toWitness(storedAuction.auctionEnd, []);
      // Should only have one source after deduplication
      expect(payload.optableSources).toEqual(["optable.co"]);
      // The last matcher should win
      expect(payload.optableMatchers).toEqual(["matcher2"]);
    });
  });

  describe("trackAuctionEnd - edge cases", () => {
    beforeEach(() => {
      analytics = new OptablePrebidAnalytics(mockOptableInstance);
    });

    it("should handle bidsReceived with unknown bidId", async () => {
      const event = {
        auctionId: "auction-unknown-bid",
        timeout: 3000,
        bidderRequests: [
          {
            bidderCode: "bidder1",
            bidderRequestId: "req-1",
            ortb2: {
              site: { domain: "example.com" },
              user: {
                eids: [],
              },
            },
            bids: [],
          },
        ],
        bidsReceived: [
          {
            requestId: "unknown-bid-id",
            cpm: 1.5,
            width: 300,
            height: 250,
            currency: "USD",
          },
        ],
        noBids: [],
        timeoutBids: [],
      };

      await analytics.trackAuctionEnd(event);

      const storedAuction = analytics["auctions"].get("auction-unknown-bid");
      expect(storedAuction).toBeDefined();
    });

    it("should create new bid object when bid not in index", async () => {
      const event = {
        auctionId: "auction-new-bid",
        timeout: 3000,
        bidderRequests: [
          {
            bidderCode: "bidder1",
            bidderRequestId: "req-1",
            ortb2: {
              site: { domain: "example.com" },
              user: {
                eids: [],
              },
            },
            bids: [
              {
                bidId: "bid-1",
                adUnitCode: "ad-unit-1",
                adUnitId: "ad-id-1",
                transactionId: "trans-1",
                src: "client",
              },
            ],
          },
        ],
        bidsReceived: [
          {
            requestId: "bid-1",
            cpm: 2.0,
            width: 728,
            height: 90,
            currency: "EUR",
            adUnitCode: "ad-unit-2",
            adUnitId: "ad-id-2",
            transactionId: "trans-2",
            src: "server",
          },
        ],
        noBids: [],
        timeoutBids: [],
      };

      await analytics.trackAuctionEnd(event);

      const storedAuction = analytics["auctions"].get("auction-new-bid");
      expect(storedAuction).toBeDefined();
    });

    it("should mark bids with NO_BID status when bids exist", async () => {
      const event = {
        auctionId: "auction-no-bid-with-bids",
        timeout: 3000,
        bidderRequests: [
          {
            bidderCode: "bidder1",
            bidderRequestId: "req-1",
            ortb2: {
              site: { domain: "example.com" },
              user: { eids: [] },
            },
            bids: [
              {
                bidId: "bid-1",
                adUnitCode: "ad-unit-1",
                adUnitId: "ad-id-1",
                transactionId: "trans-1",
                src: "client",
              },
            ],
          },
        ],
        bidsReceived: [],
        noBids: [{ bidderRequestId: "req-1" }],
      };

      await analytics.trackAuctionEnd(event);

      const storedAuction = analytics["auctions"].get("auction-no-bid-with-bids");
      const payload = await analytics.toWitness(storedAuction!.auctionEnd, []);
      expect(payload.bidderRequests[0].status).toBe("NO_BID");
    });

    it("should mark bids with TIMEOUT status when bids exist", async () => {
      // Pre-populate pendingTimeoutBids as Prebid's BID_TIMEOUT fires before auctionEnd
      analytics["pendingTimeoutBids"].set("auction-timeout-with-bids", [
        { bidderRequestId: "req-1", auctionId: "auction-timeout-with-bids" },
      ]);

      const event = {
        auctionId: "auction-timeout-with-bids",
        timeout: 3000,
        bidderRequests: [
          {
            bidderCode: "bidder1",
            bidderRequestId: "req-1",
            ortb2: {
              site: { domain: "example.com" },
              user: { eids: [] },
            },
            bids: [
              {
                bidId: "bid-1",
                adUnitCode: "ad-unit-1",
                adUnitId: "ad-id-1",
                transactionId: "trans-1",
                src: "client",
              },
            ],
          },
        ],
        bidsReceived: [],
        noBids: [],
      };

      await analytics.trackAuctionEnd(event);

      const storedAuction = analytics["auctions"].get("auction-timeout-with-bids");
      const payload = await analytics.toWitness(storedAuction!.auctionEnd, []);
      expect(payload.bidderRequests[0].status).toBe("TIMEOUT");
    });
  });
});
