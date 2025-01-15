import OptableSDK from "../sdk";
import { TEST_HOST, TEST_SITE } from "../test/mocks.ts";
import "./paapi.ts";

describe("OptableSDK - joinAdInterestGroups", () => {
  let SDK;
  const origNavigator = window.navigator;

  beforeEach(() => {
    SDK = new OptableSDK({ host: TEST_HOST, site: TEST_SITE });
    window.navigator = { ...origNavigator };
  });

  afterEach(() => {
    window.navigator = origNavigator;
  });

  test("injects joinAdInterestGroups func", () => {
    expect(SDK.joinAdInterestGroups).toBeDefined();
  });

  test("joinAdInterestGroups fails when join-ad-interest-group not supported", async () => {
    expect.assertions(2);
    const expected = "join-ad-interest-group not supported";
    await expect(SDK.joinAdInterestGroups()).rejects.toBe(expected);

    window.navigator.joinAdInterestGroup = function () {};
    await expect(SDK.joinAdInterestGroups()).rejects.not.toBe(expected);
  });

  test("joinAdInterestGroups fails when consent not granted", async () => {
    expect.assertions(4);
    const expected = "consent not granted for joining interest groups";

    window.navigator.joinAdInterestGroup = function () {};
    SDK.dcn.consent.deviceAccess = false;
    await expect(SDK.joinAdInterestGroups()).rejects.toBe(expected);

    SDK.dcn.consent.deviceAccess = true;
    SDK.dcn.consent.createProfilesForAdvertising = false;
    await expect(SDK.joinAdInterestGroups()).rejects.toBe(expected);

    SDK.dcn.consent.deviceAccess = true;
    SDK.dcn.consent.createProfilesForAdvertising = true;
    SDK.dcn.consent.measureAdvertisingPerformance = false;
    await expect(SDK.joinAdInterestGroups()).rejects.toBe(expected);

    SDK.dcn.consent.deviceAccess = true;
    SDK.dcn.consent.createProfilesForAdvertising = true;
    SDK.dcn.consent.measureAdvertisingPerformance = true;
    await expect(SDK.joinAdInterestGroups()).rejects.not.toBe(expected);
  });
});
