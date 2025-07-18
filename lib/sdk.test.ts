import { SiteResponse } from "edge/site";
import { OptableSDK, normalizeTargetingRequest } from "./sdk";
import { TEST_BASE_URL, TEST_HOST, TEST_SITE } from "./test/mocks";
import { DCN_DEFAULTS } from "./config";
import { waitFor } from "./test/utils";

const defaultConsent = DCN_DEFAULTS.consent;

describe("eid", () => {
  test("is correct", () => {
    const expected = "e:a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3";

    expect(OptableSDK.eid("123")).toEqual(expected);
    expect(OptableSDK.eid("123 ")).toEqual(expected);
    expect(OptableSDK.eid(" 123")).toEqual(expected);
    expect(OptableSDK.eid(" 123 ")).toEqual(expected);
  });

  test("ignores case", () => {
    const var1 = "tEsT@FooBarBaz.CoM";
    const var2 = "test@foobarbaz.com";
    const var3 = "TEST@FOOBARBAZ.COM";
    const var4 = "TeSt@fOObARbAZ.cOm";
    const eid = OptableSDK.eid(var1);

    expect(eid).toEqual(OptableSDK.eid(var2));
    expect(eid).toEqual(OptableSDK.eid(var3));
    expect(eid).toEqual(OptableSDK.eid(var4));
  });
});

describe("cid", () => {
  test("rejects non-string id", () => {
    expect(() => OptableSDK.cid(1 as unknown as string)).toThrow();
  });

  test("prefixes with c: by default", () => {
    expect(OptableSDK.cid("abc")).toEqual("c:abc");
  });

  test("accepts a custom variant", () => {
    expect(OptableSDK.cid("abc", 0)).toEqual("c:abc");
    for (let i = 1; i < 20; i++) {
      expect(OptableSDK.cid("abc", i)).toEqual(`c${i}:abc`);
    }

    expect(() => OptableSDK.cid("abc", -1)).toThrow();
    expect(() => OptableSDK.cid("abc", 20)).toThrow();
    expect(() => OptableSDK.cid("abc", "1" as unknown as number)).toThrow();
  });

  test("trim spaces", () => {
    expect(OptableSDK.cid(" \n abc\t")).toEqual("c:abc");
  });

  test("preserve case", () => {
    expect(OptableSDK.cid("ABCD")).toEqual("c:ABCD");
  });
});

const defaultConfig = {
  host: TEST_HOST,
  site: TEST_SITE,
  sessionID: "session",
  skipEnrichment: false,
};

describe("Breaking change detection: if typescript complains or a test fails it's likely a breaking change has occurred.", () => {
  beforeEach(() => localStorage.clear());

  test("TEST SHOULD NEVER NEED TO BE UPDATED, UNLESS MAJOR VERSION UPDATE: constructor with cookies and initPassport set", async () => {
    new OptableSDK({
      ...defaultConfig,
      cookies: false,
      initPassport: false,
    });
  });

  test("TEST SHOULD NEVER NEED TO BE UPDATED, UNLESS MAJOR VERSION UPDATE: constructor not set", async () => {
    new OptableSDK({ ...defaultConfig });
  });

  test("TEST SHOULD NEVER NEED TO BE UPDATED, UNLESS MAJOR VERSION UPDATE: identify", async () => {
    await new OptableSDK({ ...defaultConfig }).identify("c:a1a335b8216658319f96a4b0c718557ba41dd1f5");
    await new OptableSDK({ ...defaultConfig }).identify(
      "c:a1a335b8216658319f96a4b0c718557ba41dd1f5",
      "other-identifier"
    );
  });

  test("TEST SHOULD NEVER NEED TO BE UPDATED, UNLESS MAJOR VERSION UPDATE: witness", async () => {
    await new OptableSDK({ ...defaultConfig }).witness("event");
    await new OptableSDK({ ...defaultConfig }).witness("event", { property: "value" });
  });

  test("TEST SHOULD NEVER NEED TO BE UPDATED, UNLESS MAJOR VERSION UPDATE: profile", async () => {
    await new OptableSDK({ ...defaultConfig }).profile({
      propString: "",
      propBool: true,
      propNumber: 3,
    });
  });

  test("TEST SHOULD NEVER NEED TO BE UPDATED, UNLESS MAJOR VERSION UPDATE: targeting", async () => {
    const result = await new OptableSDK({ ...defaultConfig }).targeting("c:a1a335b8216658319f96a4b0c718557ba41dd1f5");
    ["audience", "user"].forEach((key) => expect(Object.keys(result)).toContain(key));
  });

  test("TEST SHOULD NEVER NEED TO BE UPDATED, UNLESS MAJOR VERSION UPDATE: uid2Token", async () => {
    await new OptableSDK({ ...defaultConfig }).uid2Token("c:a1a335b8216658319f96a4b0c718557ba41dd1f5");
  });

  test("TEST SHOULD NEVER NEED TO BE UPDATED, UNLESS MAJOR VERSION UPDATE: targetingFromCache", async () => {
    const result = new OptableSDK({ ...defaultConfig }).targetingFromCache();
    expect(result).toBeNull();

    await new OptableSDK({ ...defaultConfig }).targeting("c:a1a335b8216658319f96a4b0c718557ba41dd1f5");
    const result2 = new OptableSDK({ ...defaultConfig }).targetingFromCache();
    expect(typeof result2).toBe("object");
  });

  test("TEST SHOULD NEVER NEED TO BE UPDATED, UNLESS MAJOR VERSION UPDATE: site", async () => {
    const result = await new OptableSDK({ ...defaultConfig }).site();
    ["interestGroupPixel", "auctionConfigURL", "auctionConfig", "getTopicsURL"].forEach((key) =>
      expect(Object.keys(result)).toContain(key)
    );
  });

  test("TEST SHOULD NEVER NEED TO BE UPDATED, UNLESS MAJOR VERSION UPDATE: siteFromCache", async () => {
    const result = new OptableSDK({ ...defaultConfig }).siteFromCache();
    expect(result).toBeNull();

    await new OptableSDK({ ...defaultConfig }).site();
    const result2 = new OptableSDK({ ...defaultConfig }).siteFromCache() as SiteResponse;
    ["interestGroupPixel", "auctionConfigURL", "auctionConfig", "getTopicsURL"].forEach((key) =>
      expect(Object.keys(result2)).toContain(key)
    );
  });

  test("TEST SHOULD NEVER NEED TO BE UPDATED, UNLESS MAJOR VERSION UPDATE: targetingClearCache", () => {
    new OptableSDK({ ...defaultConfig }).targetingClearCache();
  });

  test("TEST SHOULD NEVER NEED TO BE UPDATED, UNLESS MAJOR VERSION UPDATE: prebidORTB2", async () => {
    const result = await new OptableSDK({ ...defaultConfig }).prebidORTB2();
    expect(Object.keys(result)).toContain("user");
  });

  test("TEST SHOULD NEVER NEED TO BE UPDATED, UNLESS MAJOR VERSION UPDATE: prebidORTB2FromCache", async () => {
    const result = new OptableSDK({ ...defaultConfig }).prebidORTB2FromCache();
    expect(Object.keys(result)).toContain("user");

    await new OptableSDK({ ...defaultConfig }).prebidORTB2();
    const result2 = new OptableSDK({ ...defaultConfig }).prebidORTB2FromCache();
    expect(Object.keys(result2)).toContain("user");
  });

  test("TEST SHOULD NEVER NEED TO BE UPDATED, UNLESS MAJOR VERSION UPDATE: targetingKeyValues", async () => {
    const result = await new OptableSDK({ ...defaultConfig }).targetingKeyValues();
    expect(typeof result).toBe("object");
  });

  test("TEST SHOULD NEVER NEED TO BE UPDATED, UNLESS MAJOR VERSION UPDATE: targetingKeyValuesFromCache", () => {
    const result = new OptableSDK({ ...defaultConfig }).targetingKeyValuesFromCache();
    expect(typeof result).toBe("object");
  });

  test("TEST SHOULD NEVER NEED TO BE UPDATED, UNLESS MAJOR VERSION UPDATE: tokenize", async () => {
    const result = await new OptableSDK({ ...defaultConfig }).tokenize("myid");
    ["User"].forEach((key) => expect(Object.keys(result)).toContain(key));
  });

  test("TEST SHOULD NEVER NEED TO BE UPDATED, UNLESS MAJOR VERSION UPDATE: eid", async () => {
    const myId = OptableSDK.eid("myid");
    expect(typeof myId).toBe("string");
  });

  test("TEST SHOULD NEVER NEED TO BE UPDATED, UNLESS MAJOR VERSION UPDATE: sha256", async () => {
    const shaValue = OptableSDK.sha256("someValue");
    expect(typeof shaValue).toBe("string");
  });

  test("TEST SHOULD NEVER NEED TO BE UPDATED, UNLESS MAJOR VERSION UPDATE: cid", async () => {
    const cidValue = OptableSDK.cid("someValue");
    expect(typeof cidValue).toBe("string");

    const cidValueWithVariant = OptableSDK.cid("someValue", 4);
    expect(typeof cidValueWithVariant).toBe("string");
  });

  test("TEST SHOULD NEVER NEED TO BE UPDATED, UNLESS MAJOR VERSION UPDATE: TargetingKeyValues", async () => {
    const result = OptableSDK.TargetingKeyValues({ audience: [], user: [] });
    expect(typeof result).toBe("object");
    OptableSDK.TargetingKeyValues({ audience: [] });
    OptableSDK.TargetingKeyValues({ user: [] });
    OptableSDK.TargetingKeyValues({});
  });

  test("TEST SHOULD NEVER NEED TO BE UPDATED, UNLESS MAJOR VERSION UPDATE: PrebidORTB2", async () => {
    const result = OptableSDK.PrebidORTB2({ audience: [], user: [] });
    expect(typeof result).toBe("object");
    expect(Object.keys(result)).toContain("user");
  });
});

describe("behavior testing of", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test("constructor with cookies and initPassport set to false initializes without localStorage", async () => {
    const fetchSpy = jest.spyOn(window, "fetch");
    const sdk = new OptableSDK({
      ...defaultConfig,
      cookies: false,
      initPassport: false,
    });
    expect(sdk).toBeInstanceOf(OptableSDK);
    expect(sdk.dcn).toEqual({
      consent: {
        ...defaultConsent,
      },
      host: "hostmock.com",
      site: "site",
      cookies: false,
      initPassport: false,
      readOnly: false,
      experiments: [],
      sessionID: "session",
      skipEnrichment: false,
      optableCacheTargeting: "optable-cache:targeting",
    });
    await sdk["init"];
    expect(localStorage.setItem).toBeCalledTimes(0);

    // Testing of cookies param was applied as expected
    await sdk.identify("c:a1a335b8216658319f96a4b0c718557ba41dd1f5");
    expect(fetchSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        method: "POST",
        _bodyText: '["c:a1a335b8216658319f96a4b0c718557ba41dd1f5"]',
        url: `${TEST_BASE_URL}/identify?osdk=web-0.0.0-experimental&sid=session&o=site&cookies=no&passport=`,
      })
    );

    // Testing of passport is sent when cookies is false (retrieved from the first call)
    await sdk.identify("c:a1a335b8216658319f96a4b0c718557ba41dd1f6");
    expect(fetchSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        method: "POST",
        _bodyText: '["c:a1a335b8216658319f96a4b0c718557ba41dd1f6"]',
        url: `${TEST_BASE_URL}/identify?osdk=web-0.0.0-experimental&sid=session&o=site&cookies=no&passport=PASSPORT`,
      })
    );
  });

  test("constructor with cookies and initPassport properties not provided initializes with localStorage and cookies", async () => {
    const fetchSpy = jest.spyOn(window, "fetch");
    const sdk = new OptableSDK({ ...defaultConfig });
    expect(sdk).toBeInstanceOf(OptableSDK);
    expect(sdk.dcn).toEqual({
      consent: {
        ...defaultConsent,
      },
      host: "hostmock.com",
      site: "site",
      cookies: true,
      initPassport: true,
      readOnly: false,
      experiments: [],
      sessionID: "session",
      skipEnrichment: false,
      optableCacheTargeting: "optable-cache:targeting",
    });
    await sdk["init"];
    expect(window.localStorage.setItem).toHaveBeenLastCalledWith(
      expect.stringContaining("OPTABLE_SITE"),
      expect.objectContaining({})
    );

    expect(fetchSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        method: "GET",
        bodyUsed: false,
        url: expect.stringContaining("config?osdk=web-0.0.0-experimental&sid=session&o=site&cookies=yes"),
      })
    );

    // Testing of cookies param was applied as expected
    await sdk.identify("c:a1a335b8216658319f96a4b0c718557ba41dd1f5");
    expect(fetchSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        method: "POST",
        _bodyText: '["c:a1a335b8216658319f96a4b0c718557ba41dd1f5"]',
        url: `${TEST_BASE_URL}/identify?osdk=web-0.0.0-experimental&sid=session&o=site&cookies=yes`,
      })
    );
  });

  test("identify", async () => {
    const fetchSpy = jest.spyOn(window, "fetch");
    const sdk = new OptableSDK({ ...defaultConfig });

    await sdk.identify("c:a1a335b8216658319f96a4b0c718557ba41dd1f5");
    expect(fetchSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        method: "POST",
        _bodyText: '["c:a1a335b8216658319f96a4b0c718557ba41dd1f5"]',
        url: expect.stringContaining("identify"),
      })
    );

    await sdk.identify("some-email@optable.co");
    expect(fetchSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        method: "POST",
        _bodyText: '["some-email@optable.co"]',
        url: expect.stringContaining("identify"),
      })
    );

    await sdk.identify(
      "some-email2@optable.co",
      undefined as unknown as string,
      null as unknown as string,
      "",
      0 as unknown as string,
      "some-email3@optable.co"
    );
    expect(fetchSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        method: "POST",
        _bodyText: '["some-email2@optable.co","some-email3@optable.co"]',
        url: expect.stringContaining("identify"),
      })
    );
  });

  test("profile", async () => {
    const fetchSpy = jest.spyOn(window, "fetch");
    const sdk = new OptableSDK({ ...defaultConfig });

    await sdk.profile({ someProp: "someValue", someBool: true, someNumber: 3 });
    expect(fetchSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        method: "POST",
        _bodyText: '{"traits":{"someProp":"someValue","someBool":true,"someNumber":3}}',
        url: expect.stringContaining("profile"),
      })
    );
  });

  test("witness", async () => {
    const fetchSpy = jest.spyOn(window, "fetch");
    const sdk = new OptableSDK({ ...defaultConfig });

    await sdk.witness("someEvent", { someProp: "someValue", someBool: true, someNumber: 3 });
    expect(fetchSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        method: "POST",
        _bodyText: '{"event":"someEvent","properties":{"someProp":"someValue","someBool":true,"someNumber":3}}',
        url: expect.stringContaining("witness"),
      })
    );
  });

  test("config has initTargeting true then constructor sends a targeting request", async () => {
    const fetchSpy = jest.spyOn(window, "fetch");
    const sdk = new OptableSDK({ ...defaultConfig, initPassport: false, initTargeting: true });
    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "GET",
          url: expect.stringContaining("v2/targeting?id=__passport__"),
        })
      );
    });
  });

  test("targeting", async () => {
    const fetchSpy = jest.spyOn(window, "fetch");
    const sdk = new OptableSDK({ ...defaultConfig });
    const initialResultFromCache = sdk.targetingFromCache();
    expect(initialResultFromCache).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalledWith(expect.objectContaining({ url: expect.stringContaining("targeting") }));

    const targeting = await sdk.targeting();
    expect(targeting).toEqual({ audience: [], user: [] });

    expect(fetchSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        method: "GET",
        url: expect.stringContaining("v2/targeting?id=__passport__"),
      })
    );

    await expect(sdk.targeting({ ids: ["someId", "someOtherId"] })).rejects.toMatch(/targeting-cascade/);

    await expect(sdk.targeting(3)).rejects.toMatch(/Expected string or object/);

    sdk.dcn.experiments = ["targeting-cascade"];
    const targetingWithParam = await sdk.targeting({ ids: ["someId", "someOtherId"] });

    expect(fetchSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        method: "GET",
        url: expect.stringContaining("v2/targeting?id=someId&id=someOtherId"),
      })
    );

    const latestResultFromCache = sdk.targetingFromCache();
    expect(latestResultFromCache).toEqual(targetingWithParam);

    sdk.targetingClearCache();
    expect(sdk.targetingFromCache()).toBeNull();
  });

  test("site", async () => {
    const fetchSpy = jest.spyOn(window, "fetch");
    const sdk = new OptableSDK({ ...defaultConfig, initPassport: false });

    const initialResultFromCache = sdk.siteFromCache();
    expect(initialResultFromCache).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();

    const site = await sdk.site();
    expect(site).toEqual({
      auctionConfig: null,
      auctionConfigURL: "",
      getTopicsURL: "https://ads.optable.co/ca/topics/v1/get?origin=70cc15ee-484c-4d26-8868-c949a5c084b8",
      interestGroupPixel: "",
    });

    expect(fetchSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        method: "GET",
        url: expect.stringContaining("config"),
      })
    );

    const latestResultFromCache = sdk.siteFromCache();
    expect(latestResultFromCache).toEqual(site);
  });

  test("prebidORTB2", async () => {
    const fetchSpy = jest.spyOn(window, "fetch");
    const sdk = new OptableSDK({ ...defaultConfig });

    const initialResultFromCache = sdk.prebidORTB2FromCache();
    expect(initialResultFromCache).toEqual({ user: { data: [], ext: { eids: [] } } });
    expect(fetchSpy).not.toHaveBeenCalledWith(expect.objectContaining({ url: expect.stringContaining("targeting") }));

    const prebid = await sdk.prebidORTB2();
    expect(prebid).toEqual({ user: { data: [], ext: { eids: [] } } });

    expect(fetchSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        method: "GET",
        url: expect.stringContaining("targeting"),
      })
    );
  });

  test("targetingKeyValues", async () => {
    const fetchSpy = jest.spyOn(window, "fetch");
    const sdk = new OptableSDK({ ...defaultConfig });

    const initialResultFromCache = sdk.targetingKeyValuesFromCache();
    expect(initialResultFromCache).toEqual({});
    expect(fetchSpy).not.toHaveBeenCalledWith(expect.objectContaining({ url: expect.stringContaining("targeting") }));

    const prebid = await sdk.targetingKeyValues();
    expect(prebid).toEqual({});

    expect(fetchSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        method: "GET",
        url: expect.stringContaining("targeting"),
      })
    );
  });

  test("tokenize", async () => {
    const fetchSpy = jest.spyOn(window, "fetch");
    const sdk = new OptableSDK({ ...defaultConfig });

    await sdk.tokenize("someId");
    expect(fetchSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        method: "POST",
        _bodyText: '{"id":"someId"}',
        url: expect.stringContaining("v1/tokenize"),
      })
    );
  });

  test("tokenize supports v2 experiment", async () => {
    const fetchSpy = jest.spyOn(window, "fetch");
    const sdk = new OptableSDK({ ...defaultConfig, experiments: ["tokenize-v2"] });

    await sdk.tokenize("someId");
    expect(fetchSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        method: "POST",
        _bodyText: '{"id":"someId"}',
        url: expect.stringContaining("v2/tokenize"),
      })
    );
  });
});

describe("normalizeTargetingRequest", () => {
  test("normalizes string input", () => {
    const input = "c:123";
    const result = normalizeTargetingRequest(input);
    expect(result).toEqual({ ids: ["c:123"] });
  });

  test("normalizes object input", () => {
    const result = normalizeTargetingRequest({});
    expect(result).toEqual({ ids: [] });
  });

  test("fails for unknown types", () => {
    expect(() => normalizeTargetingRequest(3)).toThrowError(/Expected string or object/);
  });
});
