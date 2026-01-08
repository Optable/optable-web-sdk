import OptableSDK from "../sdk";
import { TEST_HOST, TEST_SITE } from "../test/mocks.ts";
import "./gpt.ts";

describe("OptableSDK - installGPTSecureSignals", () => {
  let SDK;

  beforeEach(() => {
    // Initialize the SDK instance
    SDK = new OptableSDK({ host: TEST_HOST, site: TEST_SITE });

    // Reset global googletag object
    window.googletag = { cmd: [], secureSignalProviders: [] };
  });

  test("installs secure signals when provided valid signals", async () => {
    const signals = [
      { provider: "provider1", id: "idString1" },
      { provider: "provider2", id: "idString2" },
    ];

    // Call the installGPTSecureSignals method
    SDK.installGPTSecureSignals(...signals);

    // Execute all googletag commands
    window.googletag.cmd.forEach((cmd) => cmd());

    // Expectations
    expect(window.googletag.secureSignalProviders).toHaveLength(2);
    expect(window.googletag.secureSignalProviders).toEqual([
      {
        id: "provider1",
        collectorFunction: expect.any(Function),
      },
      {
        id: "provider2",
        collectorFunction: expect.any(Function),
      },
    ]);

    // Verify the collector functions
    const collectedIds = window.googletag.secureSignalProviders.map((provider) => provider.collectorFunction());
    const results = await Promise.all(collectedIds);
    expect(results).toEqual(["idString1", "idString2"]);
  });

  test("does nothing when no signals are provided", () => {
    // Call the installGPTSecureSignals method with no arguments
    SDK.installGPTSecureSignals();

    // Expectations
    expect(window.googletag.cmd).toHaveLength(0);
    expect(window.googletag.secureSignalProviders).toHaveLength(0);
  });

  test("handles an empty signals array gracefully", () => {
    SDK.installGPTSecureSignals();

    // Expectations
    expect(window.googletag.cmd).toHaveLength(0); // cmd should remain empty
    expect(window.googletag.secureSignalProviders).toHaveLength(0); // No secureSignalProviders should be added
  });
});

describe("installGPTEventListeners", () => {
  let sdk;
  let handlers;

  const makeGptMock = () => {
    handlers = {};
    const pubads = {
      addEventListener: (eventName, handler) => {
        handlers[eventName] = handlers[eventName] || [];
        handlers[eventName].push(handler);
      },
    };
    global.googletag = {
      cmd: [],
      pubads: () => pubads,
    };
    // Simulate immediate execution of pushed functions (like GPT does)
    global.googletag.cmd.push = (fn) => fn();
  };

  const makeEvent = () => ({
    advertiserId: 123,
    campaignId: 456,
    creativeId: 789,
    isEmpty: false,
    lineItemId: 111,
    serviceName: "svc",
    size: "300x250",
    slot: { getSlotElementId: () => "slot-id" },
    sourceAgnosticCreativeId: 222,
    sourceAgnosticLineItemId: 333,
  });

  beforeEach(() => {
    makeGptMock();
    sdk = new OptableSDK({ host: "dcn.example", site: "site" });
    jest.spyOn(sdk, "witness").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete global.googletag;
  });

  test("default registers both events and sends full props", () => {
    sdk.installGPTEventListeners();
    expect(Object.keys(handlers).sort()).toEqual(["impressionViewable", "slotRenderEnded"].sort());

    const event = makeEvent();
    handlers.slotRenderEnded.forEach((h) => h(event));

    // ensure witness was called for the slotRenderEnded event
    const call = sdk.witness.mock.calls.find((c) => c[0] === "gpt_events_slot_render_ended");
    expect(call).toBeDefined();
    const props = call[1];
    expect(props).toHaveProperty("advertiser_id");
    expect(props).toHaveProperty("slot_element_id", "slot-id");
  });

  test("per-event filtering sends only specified witness keys", () => {
    sdk.installGPTEventListeners({ impressionViewable: ["slot_element_id", "is_empty"] });
    expect(Object.keys(handlers)).toEqual(["impressionViewable"]);

    const event = makeEvent();
    handlers.impressionViewable.forEach((h) => h(event));

    expect(sdk.witness).toHaveBeenCalledWith("gpt_events_impression_viewable", {
      slot_element_id: "slot-id",
      is_empty: "false",
    });
  });

  test('slotRenderEnded: "all" sends full props', () => {
    sdk.installGPTEventListeners({ slotRenderEnded: "all" });
    expect(Object.keys(handlers)).toEqual(["slotRenderEnded"]);

    const event = makeEvent();
    handlers.slotRenderEnded.forEach((h) => h(event));

    const call = sdk.witness.mock.calls.find((c) => c[0] === "gpt_events_slot_render_ended");
    expect(call).toBeDefined();
    const props = call[1];
    expect(props).toHaveProperty("advertiser_id");
    expect(props).toHaveProperty("slot_element_id", "slot-id");
  });

  test("install is idempotent", () => {
    sdk.installGPTEventListeners();
    const firstCount = Object.keys(handlers).length;
    // second call should be a no-op
    sdk.installGPTEventListeners();
    const secondCount = Object.keys(handlers).length;
    expect(firstCount).toEqual(secondCount);
  });
});
