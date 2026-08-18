import OptableSDK from "../sdk";
import { TEST_HOST, TEST_SITE } from "../test/mocks.ts";
import "./gpt.ts";
import { resetRegisteredSecureSignalProviders } from "./gpt.ts";

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

describe("OptableSDK - installGPTSecureSignalsFromEIDs", () => {
  let sdk;

  const eid = (source, id, extra = {}) => ({ source, uids: [{ id }], ...extra });

  beforeEach(() => {
    sdk = new OptableSDK({ host: TEST_HOST, site: TEST_SITE });
    window.googletag = { cmd: [], secureSignalProviders: [] };
    resetRegisteredSecureSignalProviders();
  });

  const drain = () => window.googletag.cmd.forEach((cmd) => cmd());

  test("derives one signal per EID when no filter is given", () => {
    sdk.installGPTSecureSignalsFromEIDs([eid("uidapi.com", "token-a"), eid("id5-sync.com", "id5-b")]);
    drain();

    expect(window.googletag.secureSignalProviders.map((p) => p.id)).toEqual(["uidapi.com", "id5-sync.com"]);
  });

  test("sources filter keeps only the listed sources", () => {
    sdk.installGPTSecureSignalsFromEIDs([eid("uidapi.com", "token-a"), eid("id5-sync.com", "id5-b")], {
      sources: ["uidapi.com"],
    });
    drain();

    expect(window.googletag.secureSignalProviders.map((p) => p.id)).toEqual(["uidapi.com"]);
  });

  test("an empty filter list places no constraint on that field", () => {
    sdk.installGPTSecureSignalsFromEIDs([eid("uidapi.com", "token-a")], { sources: [], matchers: [] });
    drain();

    expect(window.googletag.secureSignalProviders.map((p) => p.id)).toEqual(["uidapi.com"]);
  });

  test("inserter and matcher filters are applied together", () => {
    const eids = [
      eid("uidapi.com", "token-a", { inserter: "optable.co", matcher: "uid2" }),
      eid("id5-sync.com", "id5-b", { inserter: "other.co", matcher: "id5" }),
    ];
    sdk.installGPTSecureSignalsFromEIDs(eids, { inserters: ["optable.co"], matchers: ["uid2"] });
    drain();

    expect(window.googletag.secureSignalProviders.map((p) => p.id)).toEqual(["uidapi.com"]);
  });

  test("registers each provider once across repeat calls", async () => {
    sdk.installGPTSecureSignalsFromEIDs([eid("uidapi.com", "token-a")]);
    sdk.installGPTSecureSignalsFromEIDs([eid("uidapi.com", "token-b")]);
    drain();

    expect(window.googletag.secureSignalProviders).toHaveLength(1);
    await expect(window.googletag.secureSignalProviders[0].collectorFunction()).resolves.toBe("token-a");
  });

  test("skips EIDs with no usable uid, and no-ops on an empty list", () => {
    sdk.installGPTSecureSignalsFromEIDs([{ source: "uidapi.com", uids: [] }, { source: "id5-sync.com" }]);
    sdk.installGPTSecureSignalsFromEIDs([]);
    drain();

    expect(window.googletag.secureSignalProviders).toHaveLength(0);
  });
});

describe("OptableSDK - setGPTTargeting", () => {
  let sdk;
  let configs;

  beforeEach(() => {
    sdk = new OptableSDK({ host: TEST_HOST, site: TEST_SITE });
    configs = [];
    window.googletag = { cmd: [], setConfig: (c) => configs.push(c) };
  });

  const drain = () => window.googletag.cmd.forEach((cmd) => cmd());

  test("writes key-values through setConfig", () => {
    sdk.setGPTTargeting({ optableSignalEnrichment: "treatment,enriched,nocontext" });
    drain();

    expect(configs).toEqual([{ targeting: { optableSignalEnrichment: "treatment,enriched,nocontext" } }]);
  });

  test("each call is a separate setConfig, which GPT merges", () => {
    sdk.setGPTTargeting({ a: "1" });
    sdk.setGPTTargeting({ b: ["2", "3"] });
    drain();

    expect(configs).toEqual([{ targeting: { a: "1" } }, { targeting: { b: ["2", "3"] } }]);
  });

  test("no-ops on empty or missing key-values", () => {
    sdk.setGPTTargeting({});
    sdk.setGPTTargeting(undefined);

    expect(window.googletag.cmd).toHaveLength(0);
  });
});

describe("OptableSDK - setGPTContextualTargeting", () => {
  let sdk;
  let targeting;

  beforeEach(() => {
    sdk = new OptableSDK({ host: TEST_HOST, site: TEST_SITE });
    targeting = [];
    window.googletag = {
      cmd: [],
      pubads: () => ({ setTargeting: (key, values) => targeting.push([key, values]) }),
    };
  });

  const drain = () => window.googletag.cmd.forEach((cmd) => cmd());

  const withClassifications = (classifications) => {
    // Stand in for a resolved ctxSegments() call, which caches the response on the instance.
    sdk.contextualResponse = { classifications };
  };

  test("pushes cached contextual key-values to pubads", () => {
    withClassifications({
      categories: [
        { id: "53", taxonomy: "iab_ct_3_1" },
        { id: "91", taxonomy: "iab_ct_3_1" },
      ],
      keywords: [{ keyword: "playoffs", prominence: 1 }],
    });

    sdk.setGPTContextualTargeting();
    drain();

    expect(targeting).toEqual([
      ["iab_ct_3_1", ["53", "91"]],
      ["ctx_kw", ["playoffs"]],
    ]);
  });

  test("forwards taxonomyKeys and options to ctxTargetingKeyValues", () => {
    withClassifications({
      categories: [{ id: "53", taxonomy: "iab_ct_3_1" }],
      keywords: [{ keyword: "playoffs", prominence: 1 }],
    });

    sdk.setGPTContextualTargeting({ iab_ct_3_1: "ctx_cat" }, { keywordKey: "" });
    drain();

    expect(targeting).toEqual([["ctx_cat", ["53"]]]);
  });

  test("no-ops when no contextual response has been fetched", () => {
    sdk.setGPTContextualTargeting();

    expect(window.googletag.cmd).toHaveLength(0);
  });
});
