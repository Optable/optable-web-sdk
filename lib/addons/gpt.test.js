import OptableSDK from "../sdk";
import "./gpt.ts";

describe("OptableSDK - installGPTSecureSignals", () => {
  let SDK;

  beforeEach(() => {
    // Initialize the SDK instance
    SDK = new OptableSDK({ host: "localhost", site: "test" });

    // Reset global googletag object
    window.googletag = { cmd: [], secureSignalProviders: [] };
  });

  test("installs secure signals when provided valid signals", () => {
    const signals = [
      ["provider1", "idString1"],
      ["provider2", "idString2"],
    ];

    // Call the installGPTSecureSignals method
    SDK.installGPTSecureSignals(...signals);

    // Execute all googletag commands
    window.googletag.cmd.forEach((cmd) => cmd());

    // Expectations
    expect(window.googletag.secureSignalProviders).toHaveLength(2);
    expect(window.googletag.secureSignalProviders).toEqual([
      {
        id: 'provider1', 
        collectorFunction: expect.any(Function),
      },
      {
        id: 'provider2', 
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
