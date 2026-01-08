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

      const result = await analytics.toWitness(auctionEndEvent, bidWonEvent);

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

      expect(result.bidWon).toMatchObject({
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

      const result = await analytics.toWitness(auctionEndEvent, bidWonEvent);

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
      analytics = new OptablePrebidAnalytics(mockOptableInstance, {
        analytics: true,
        tenant: "test-tenant",
      });
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

      // First track the auction end
      await analytics.trackAuctionEnd(auctionEndEvent);

      // Then track the bid won
      await analytics.trackBidWon(bidWonEvent);

      expect(mockOptableInstance.witness).toHaveBeenCalledWith(
        "optable.prebid.auction",
        expect.objectContaining({
          auctionId: "auction-complete",
          tenant: "test-tenant",
          missed: false,
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

      expect(mockOptableInstance.witness).toHaveBeenCalledWith(
        "optable.prebid.auction",
        expect.objectContaining({
          missed: true,
        })
      );
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
      expect(mockPbjs.onEvent).toHaveBeenCalledTimes(2);
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
        timeoutBids: [],
      };

      await analytics.trackAuctionEnd(event);

      const storedAuction = analytics["auctions"].get("auction-with-bids");
      expect(storedAuction).toBeDefined();
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
              user: {
                eids: [],
              },
            },
            bids: [],
          },
        ],
        bidsReceived: [],
        noBids: [{ bidderRequestId: "req-1" }],
        timeoutBids: [],
      };

      await analytics.trackAuctionEnd(event);

      const storedAuction = analytics["auctions"].get("auction-no-bids");
      expect(storedAuction).toBeDefined();
    });

    it("should handle timeoutBids and update status", async () => {
      const event = {
        auctionId: "auction-timeout",
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
        timeoutBids: [{ bidderRequestId: "req-1" }],
      };

      await analytics.trackAuctionEnd(event);

      const storedAuction = analytics["auctions"].get("auction-timeout");
      expect(storedAuction).toBeDefined();
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

      const result = await analytics.toWitness(auctionEndEvent, bidWonEvent);

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

      const result = await analytics.toWitness(auctionEndEvent, bidWonEvent);

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

      const result = await analytics.toWitness(auctionEndEvent, bidWonEvent);

      expect(window.optable.customAnalytics).toHaveBeenCalled();
      expect(result).toMatchObject(customData);

      delete (window as any).optable;
    });
  });

  describe("setHooks", () => {
    beforeEach(() => {
      analytics = new OptablePrebidAnalytics(mockOptableInstance, {
        debug: true,
      });
    });

    it("should process missed auctionEnd events", () => {
      const mockPbjs = {
        getEvents: jest.fn().mockReturnValue([
          {
            eventType: "auctionEnd",
            args: {
              auctionId: "missed-auction",
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

      expect(analytics["auctions"].has("missed-auction")).toBe(true);
      const auction = analytics["auctions"].get("missed-auction");
      expect(auction?.missed).toBe(true);
    });

    it("should process missed bidWon events", async () => {
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

      // Wait for async operations to complete
      await new Promise((resolve) => setTimeout(resolve, 10));

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

      expect(mockPbjs.onEvent).toHaveBeenCalledWith("auctionEnd", expect.any(Function));
      expect(mockPbjs.onEvent).toHaveBeenCalledWith("bidWon", expect.any(Function));
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
        bidsReceived: [],
        noBids: [{ bidderRequestId: "req-1" }],
        timeoutBids: [],
      };

      await analytics.trackAuctionEnd(event);

      const storedAuction = analytics["auctions"].get("auction-no-bid-with-bids");
      expect(storedAuction).toBeDefined();
    });

    it("should mark bids with TIMEOUT status when bids exist", async () => {
      const event = {
        auctionId: "auction-timeout-with-bids",
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
        bidsReceived: [],
        noBids: [],
        timeoutBids: [{ bidderRequestId: "req-1" }],
      };

      await analytics.trackAuctionEnd(event);

      const storedAuction = analytics["auctions"].get("auction-timeout-with-bids");
      expect(storedAuction).toBeDefined();
    });
  });
});
