import OptableSDK from "../sdk";
import { TEST_HOST, TEST_SITE } from "../test/mocks.ts";
import "./paapi.ts";

describe("OptableSDK - installGPTAuctionConfigs", () => {
  test("Only pushes command to installGPTAuctionConfigs once even when called multiple times", () => {
    const SDK = new OptableSDK({ host: TEST_HOST, site: TEST_SITE });
    window.googletag = {
      cmd: [],
    };

    SDK.installGPTAuctionConfigs();
    const cmd1 = window.googletag.cmd.shift();
    expect(cmd1).toBeDefined();

    SDK.installGPTAuctionConfigs();
    const cmd2 = window.googletag.cmd.shift();
    expect(cmd2).not.toBeDefined();
  });

  test("Executes GPT command with correct auctionConfig", () => {
    const SDK = new OptableSDK({ host: TEST_HOST, site: TEST_SITE });
    const auctionConfig = { seller: "testSeller" };
    jest.spyOn(SDK, "auctionConfigFromCache").mockReturnValue(auctionConfig);
    const setConfigMock = jest.fn();
    window.googletag = {
      cmd: [],
      pubads: () => ({
        getSlots: () => [
          {
            getSizes: () => [{ getWidth: () => 300, getHeight: () => 250 }],
            setConfig: setConfigMock,
          },
        ],
      }),
    };

    SDK.installGPTAuctionConfigs();
    const cmd = window.googletag.cmd.shift();
    cmd();

    window.googletag.pubads().getSlots()[0];
    expect(setConfigMock).toHaveBeenCalledWith({
      componentAuction: [
        {
          configKey: "testSeller-300x250",
          auctionConfig: {
            ...auctionConfig,
            requestedSize: { width: "300px", height: "250px" },
          },
        },
      ],
    });
  });

  test("Does not set config if auctionConfigFromCache returns null", () => {
    const SDK = new OptableSDK({ host: TEST_HOST, site: TEST_SITE });
    jest.spyOn(SDK, "auctionConfigFromCache").mockReturnValue(null);
    const setConfigMock = jest.fn();
    window.googletag = {
      cmd: [],
      pubads: () => ({
        getSlots: () => [
          {
            getSizes: () => [{ getWidth: () => 300, getHeight: () => 250 }],
            setConfig: setConfigMock,
          },
        ],
      }),
    };

    SDK.installGPTAuctionConfigs();
    const cmd = window.googletag.cmd.shift();
    cmd();

    window.googletag.pubads().getSlots()[0];
    expect(setConfigMock).not.toHaveBeenCalled();
  });

  test("Filters slots based on provided filter function", () => {
    const SDK = new OptableSDK({ host: TEST_HOST, site: TEST_SITE });
    const auctionConfig = { seller: "testSeller" };
    jest.spyOn(SDK, "auctionConfigFromCache").mockReturnValue(auctionConfig);

    const setConfigMock1 = jest.fn();
    const setConfigMock2 = jest.fn();

    window.googletag = {
      cmd: [],
      pubads: () => ({
        getSlots: () => [
          { getSizes: () => [{ getWidth: () => 300, getHeight: () => 250 }], setConfig: setConfigMock1 },
          { getSizes: () => [{ getWidth: () => 728, getHeight: () => 90 }], setConfig: setConfigMock2 },
        ],
      }),
    };

    const filter = jest.fn((slot) => slot.getSizes()[0].getWidth() === 300);
    SDK.installGPTAuctionConfigs(filter);
    const cmd = window.googletag.cmd.shift();
    cmd();

    window.googletag.pubads().getSlots();
    expect(filter).toHaveBeenCalledTimes(2);
    expect(setConfigMock1).toHaveBeenCalled();
    expect(setConfigMock2).not.toHaveBeenCalled();
  });
});

describe("OptableSDK - auctionConfigFromCache", () => {
  test("Returns null if siteFromCache returns null", () => {
    const SDK = new OptableSDK({ host: TEST_HOST, site: TEST_SITE });
    jest.spyOn(SDK, "siteFromCache").mockReturnValue(null);

    const result = SDK.auctionConfigFromCache();
    expect(result).toBeNull();
  });

  test("Returns auctionConfig if siteFromCache returns a siteConfig with auctionConfig", () => {
    const SDK = new OptableSDK({ host: TEST_HOST, site: TEST_SITE });
    const auctionConfig = { key: "value" };
    jest.spyOn(SDK, "siteFromCache").mockReturnValue({ auctionConfig });

    const result = SDK.auctionConfigFromCache();
    expect(result).toEqual(auctionConfig);
  });

  test("Returns null if siteFromCache returns a siteConfig without auctionConfig", () => {
    const SDK = new OptableSDK({ host: TEST_HOST, site: TEST_SITE });
    jest.spyOn(SDK, "siteFromCache").mockReturnValue({});

    const result = SDK.auctionConfigFromCache();
    expect(result).toBeNull();
  });
});
