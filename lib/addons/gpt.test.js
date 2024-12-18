import OptableSDK from "../sdk";
import { TEST_HOST, TEST_SITE } from "../test/mocks.ts";
import "./gpt.ts";

describe("OptableSDK - installGPTEventListeners", () => {
  test("Only pushes command to addEventListener once even when called multiple times", () => {
    const SDK = new OptableSDK({ host: TEST_HOST, site: TEST_SITE });
    const addEventListener = jest.fn();
    window.googletag = {
      cmd: [],
      pubads: () => ({
        addEventListener,
      }),
    };

    SDK.installGPTEventListeners();
    const cmd1 = window.googletag.cmd.shift();
    expect(cmd1).toBeDefined();

    SDK.installGPTEventListeners();
    const cmd2 = window.googletag.cmd.shift();
    expect(cmd2).not.toBeDefined();
  });

  test("calls witness function on slotRenderEnded and impressionViewable events", () => {
    const SDK = new OptableSDK({ host: TEST_HOST, site: TEST_SITE });
    const witness = jest.spyOn(SDK, "witness");
    window.googletag = {
      cmd: [],
      pubads: () => ({
        addEventListener: jest.fn((_, callback) => callback({})),
      }),
    };

    SDK.installGPTEventListeners();
    const cmd = window.googletag.cmd.shift();
    cmd?.();

    expect(witness).toHaveBeenCalledWith("googletag.events.slotRenderEnded", expect.any(Object));
    expect(witness).toHaveBeenCalledWith("googletag.events.impressionViewable", expect.any(Object));
  });
});

describe("OptableSDK - installGPTSecureSignals", () => {
  /** @type {OptableSDK} */
  let SDK;

  beforeEach(() => {
    // Initialize the SDK instance
    SDK = new OptableSDK({ host: TEST_HOST, site: TEST_SITE });

    // Reset global googletag object
    window.googletag = { cmd: [], secureSignalProviders: [] };
  });

  test("installs secure signals when provided valid signals", () => {
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
    return Promise.all(collectedIds).then((results) => {
      expect(results).toEqual(["idString1", "idString2"]);
    });
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
