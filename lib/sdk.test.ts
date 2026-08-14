import { SiteResponse } from "edge/site";
import { http, HttpResponse } from "msw";
import { OptableSDK, normalizeTargetingRequest } from "./sdk";
import { TEST_BASE_URL, TEST_HOST, TEST_SITE } from "./test/mocks";
import { DCN_DEFAULTS } from "./config";
import { server } from "./test/server";
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

  test("TEST SHOULD NEVER NEED TO BE UPDATED, UNLESS MAJOR VERSION UPDATE: ctxSegments", async () => {
    await new OptableSDK({ ...defaultConfig }).ctxSegments("https://optable.co");
  });

  test("TEST SHOULD NEVER NEED TO BE UPDATED, UNLESS MAJOR VERSION UPDATE: ctxTargetingKeyValues", () => {
    const sdk = new OptableSDK({ ...defaultConfig });
    sdk.ctxTargetingKeyValues();
    sdk.ctxTargetingKeyValues({ iab_ct_3_1: "foo" });
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

  test("TEST SHOULD NEVER NEED TO BE UPDATED, UNLESS MAJOR VERSION UPDATE: passport", () => {
    const result = new OptableSDK({ ...defaultConfig }).passport();
    expect(result === null || typeof result === "string").toBe(true);
  });

  test("TEST SHOULD NEVER NEED TO BE UPDATED, UNLESS MAJOR VERSION UPDATE: visitorId", () => {
    const result = new OptableSDK({ ...defaultConfig }).visitorId();
    expect(result === null || typeof result === "string").toBe(true);
  });

  test("TEST SHOULD NEVER NEED TO BE UPDATED, UNLESS MAJOR VERSION UPDATE: targetingFromCache", async () => {
    const result = new OptableSDK({ ...defaultConfig }).targetingFromCache();
    expect(result).toBeNull();

    await new OptableSDK({ ...defaultConfig }).targeting("c:a1a335b8216658319f96a4b0c718557ba41dd1f5");
    const result2 = new OptableSDK({ ...defaultConfig }).targetingFromCache();
    expect(typeof result2).toBe("object");
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

  test("witness with pageContext requires explicit opt-in", async () => {
    const fetchSpy = jest.spyOn(window, "fetch");
    const sdk = new OptableSDK({
      ...defaultConfig,
      pageContext: { capture: ["url", "referrer"] },
    });

    // Call without includeContext should NOT include pageContext
    await sdk.witness("firstEvent", {});
    expect(fetchSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        method: "POST",
        _bodyText: '{"event":"firstEvent","properties":{}}',
        url: expect.stringContaining("witness"),
      })
    );

    // Call with includeContext: true should include pageContext
    await sdk.witness("secondEvent", {}, { includeContext: true });
    expect(fetchSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        method: "POST",
        _bodyText: expect.stringContaining('"pageContext"'),
        url: expect.stringContaining("witness"),
      })
    );

    // Subsequent call with includeContext: true should NOT include pageContext (already sent)
    await sdk.witness("thirdEvent", {}, { includeContext: true });
    expect(fetchSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        method: "POST",
        _bodyText: '{"event":"thirdEvent","properties":{}}',
        url: expect.stringContaining("witness"),
      })
    );
  });

  test("ctxSegments sends the provided url to /v1beta1/contextual", async () => {
    const fetchSpy = jest.spyOn(window, "fetch");
    const sdk = new OptableSDK({ ...defaultConfig });

    await sdk.ctxSegments("https://example.com/some/page");
    expect(fetchSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        method: "POST",
        _bodyText: '{"url":"https://example.com/some/page"}',
        url: expect.stringContaining("v1beta1/contextual"),
      })
    );
  });

  test("ctxSegments defaults to window.location.href when no url is provided", async () => {
    const fetchSpy = jest.spyOn(window, "fetch");
    const sdk = new OptableSDK({ ...defaultConfig });

    await sdk.ctxSegments();
    expect(fetchSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        method: "POST",
        _bodyText: JSON.stringify({ url: window.location.href }),
        url: expect.stringContaining("v1beta1/contextual"),
      })
    );
  });

  test("ctxSegments returns the parsed classifications response", async () => {
    server.use(
      http.post(`${TEST_BASE_URL}/v1beta1/contextual`, async () => {
        return HttpResponse.json(
          {
            classifications: {
              categories: [{ id: "IAB1", name: "Arts & Entertainment", score: 0.95, taxonomy: "iab_3_1" }],
            },
          },
          { status: 200 }
        );
      })
    );

    const sdk = new OptableSDK({ ...defaultConfig });
    const result = await sdk.ctxSegments("https://example.com/article");

    expect(result).toEqual({
      classifications: {
        categories: [{ id: "IAB1", name: "Arts & Entertainment", score: 0.95, taxonomy: "iab_3_1" }],
      },
    });
  });

  test("ctxSegments returns an empty categories array when the server returns one", async () => {
    server.use(
      http.post(`${TEST_BASE_URL}/v1beta1/contextual`, async () => {
        return HttpResponse.json({ classifications: { categories: [] } }, { status: 200 });
      })
    );

    const sdk = new OptableSDK({ ...defaultConfig });
    const result = await sdk.ctxSegments("https://example.com/article");

    expect(result).toEqual({ classifications: { categories: [] } });
    expect(Array.isArray(result.classifications.categories)).toBe(true);
    expect(result.classifications.categories).toHaveLength(0);
  });

  test("ctxSegments passes through a response missing the classifications key", async () => {
    server.use(
      http.post(`${TEST_BASE_URL}/v1beta1/contextual`, async () => {
        return HttpResponse.json({}, { status: 200 });
      })
    );

    const sdk = new OptableSDK({ ...defaultConfig });
    const result = await sdk.ctxSegments("https://example.com/article");

    // Current behavior: no normalization, classifications is undefined on the returned object.
    expect(result).toEqual({});
    expect(result.classifications).toBeUndefined();
  });

  test("ctxSegments passes through classifications missing the categories key", async () => {
    server.use(
      http.post(`${TEST_BASE_URL}/v1beta1/contextual`, async () => {
        return HttpResponse.json({ classifications: {} }, { status: 200 });
      })
    );

    const sdk = new OptableSDK({ ...defaultConfig });
    const result = await sdk.ctxSegments("https://example.com/article");

    // Current behavior: no normalization, categories is undefined on the returned object.
    expect(result.classifications).toEqual({});
    expect(result.classifications.categories).toBeUndefined();
  });

  test("ctxSegments passes through categories spanning multiple taxonomies", async () => {
    server.use(
      http.post(`${TEST_BASE_URL}/v1beta1/contextual`, async () => {
        return HttpResponse.json(
          {
            classifications: {
              categories: [
                { id: "IAB1", name: "Arts & Entertainment", score: 0.95, taxonomy: "iab_3_1" },
                { id: "483", name: "Motorsports", score: 0.7, taxonomy: "iab_2_2" },
              ],
            },
          },
          { status: 200 }
        );
      })
    );

    const sdk = new OptableSDK({ ...defaultConfig });
    const result = await sdk.ctxSegments("https://example.com/article");

    expect(result.classifications.categories).toEqual([
      { id: "IAB1", name: "Arts & Entertainment", score: 0.95, taxonomy: "iab_3_1" },
      { id: "483", name: "Motorsports", score: 0.7, taxonomy: "iab_2_2" },
    ]);
  });

  test("ctxSegments passes through categories missing required fields", async () => {
    server.use(
      http.post(`${TEST_BASE_URL}/v1beta1/contextual`, async () => {
        return HttpResponse.json(
          {
            classifications: {
              categories: [
                // missing `score`
                { id: "IAB1", name: "Arts & Entertainment", taxonomy: "iab_3_1" },
                // missing `name`
                { id: "IAB2", score: 0.5, taxonomy: "iab_3_1" },
                // missing `taxonomy`
                { id: "IAB3", name: "Books & Literature", score: 0.3 },
              ],
            },
          },
          { status: 200 }
        );
      })
    );

    const sdk = new OptableSDK({ ...defaultConfig });
    const result = await sdk.ctxSegments("https://example.com/article");

    // Current behavior: no validation, malformed categories are returned to the caller as-is.
    expect(result.classifications.categories).toEqual([
      { id: "IAB1", name: "Arts & Entertainment", taxonomy: "iab_3_1" },
      { id: "IAB2", score: 0.5, taxonomy: "iab_3_1" },
      { id: "IAB3", name: "Books & Literature", score: 0.3 },
    ]);
  });

  // Shared single-taxonomy payload mirroring the documented API example.
  const singleTaxonomyContextual = {
    classifications: {
      categories: [
        { id: "53", name: "Business and Finance > Business", score: 0.95, taxonomy: "iab_ct_3_1" },
        {
          id: "91",
          name: "Business and Finance > Industries > Advertising Industry",
          score: 0.98,
          taxonomy: "iab_ct_3_1",
        },
        {
          id: "58",
          name: "Business and Finance > Business > Marketing and Advertising",
          score: 0.95,
          taxonomy: "iab_ct_3_1",
        },
        {
          id: "115",
          name: "Business and Finance > Industries > Technology Industry",
          score: 0.85,
          taxonomy: "iab_ct_3_1",
        },
        { id: "90", name: "Business and Finance > Industries", score: 0.98, taxonomy: "iab_ct_3_1" },
        { id: "52", name: "Business and Finance", score: 0.98, taxonomy: "iab_ct_3_1" },
      ],
    },
  };

  test("ctxTargetingKeyValues returns {} before any ctxSegments call has populated the cache", () => {
    const sdk = new OptableSDK({ ...defaultConfig });
    expect(sdk.ctxTargetingKeyValues()).toEqual({});
    expect(sdk.ctxTargetingKeyValues({ iab_ct_3_1: "foo" })).toEqual({});
  });

  test("ctxSegments caches the response and ctxTargetingKeyValues derives GAM key-values (default keys)", async () => {
    server.use(
      http.post(`${TEST_BASE_URL}/v1beta1/contextual`, async () => {
        return HttpResponse.json(singleTaxonomyContextual, { status: 200 });
      })
    );

    const sdk = new OptableSDK({ ...defaultConfig });
    await sdk.ctxSegments("https://optable.co/");

    // Default: key is the raw taxonomy value, ids grouped under it in response order.
    expect(sdk.ctxTargetingKeyValues()).toEqual({
      iab_ct_3_1: ["53", "91", "58", "115", "90", "52"],
    });
  });

  test("ctxTargetingKeyValues renames taxonomy keys when a map is provided", async () => {
    server.use(
      http.post(`${TEST_BASE_URL}/v1beta1/contextual`, async () => {
        return HttpResponse.json(singleTaxonomyContextual, { status: 200 });
      })
    );

    const sdk = new OptableSDK({ ...defaultConfig });
    await sdk.ctxSegments("https://optable.co/");

    expect(sdk.ctxTargetingKeyValues({ iab_ct_3_1: "foo" })).toEqual({
      foo: ["53", "91", "58", "115", "90", "52"],
    });
  });

  test("ctxTargetingKeyValues filters out taxonomies absent from the provided map", async () => {
    server.use(
      http.post(`${TEST_BASE_URL}/v1beta1/contextual`, async () => {
        return HttpResponse.json(
          {
            classifications: {
              categories: [
                { id: "53", name: "Business", score: 0.95, taxonomy: "iab_ct_3_1" },
                { id: "42", name: "Finance", score: 0.9, taxonomy: "iab_ct_3_1" },
                { id: "123", name: "Sports", score: 0.8, taxonomy: "iab_ct_2_2" },
              ],
            },
          },
          { status: 200 }
        );
      })
    );

    const sdk = new OptableSDK({ ...defaultConfig });
    await sdk.ctxSegments("https://optable.co/");

    // Default: both taxonomies emitted under their raw values.
    expect(sdk.ctxTargetingKeyValues()).toEqual({
      iab_ct_3_1: ["53", "42"],
      iab_ct_2_2: ["123"],
    });

    // Map covers only iab_ct_3_1 -> iab_ct_2_2 is dropped (filter + rename).
    expect(sdk.ctxTargetingKeyValues({ iab_ct_3_1: "ctx" })).toEqual({
      ctx: ["53", "42"],
    });
  });

  test("config has initContextual true then constructor sends a contextual request", async () => {
    const fetchSpy = jest.spyOn(window, "fetch");
    new OptableSDK({ ...defaultConfig, initPassport: false, initContextual: true });
    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "POST",
          url: expect.stringContaining("v1beta1/contextual"),
        })
      );
    });
  });

  test("config has initContextual as a function then constructor sends a contextual request and invokes the callback with the response", async () => {
    const fetchSpy = jest.spyOn(window, "fetch");
    const callback = jest.fn();
    new OptableSDK({ ...defaultConfig, initPassport: false, initContextual: callback });

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "POST",
          url: expect.stringContaining("v1beta1/contextual"),
        })
      );
    });

    await waitFor(() => {
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          classifications: expect.objectContaining({ categories: expect.any(Array) }),
        })
      );
    });
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

    await expect(sdk.targeting(3)).rejects.toMatch(/Expected string or object/);

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
    expect(site).toEqual({});

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
        url: expect.stringContaining("v2/tokenize"),
      })
    );
  });

  test("supports passing a timeout to edge calls", async () => {
    const fetchSpy = jest.spyOn(window, "fetch");
    const sdk = new OptableSDK({ ...defaultConfig, timeout: "30ms" });
    await sdk.targeting("someId");
    expect(fetchSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        method: "GET",
        url: expect.stringContaining("&timeout=30ms"),
      })
    );
  });
});

describe("passport and visitorId", () => {
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    localStorage.clear();
    warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  test("returns null and warns once when no passport is cached", () => {
    const sdk = new OptableSDK({ ...defaultConfig, initPassport: false });

    expect(sdk.passport()).toBeNull();
    expect(sdk.passport()).toBeNull();
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0][0]).toMatch(/\[Optable\] passport\(\) returned null/);

    expect(sdk.visitorId()).toBeNull();
    expect(sdk.visitorId()).toBeNull();
    expect(warnSpy).toHaveBeenCalledTimes(2);
    expect(warnSpy.mock.calls[1][0]).toMatch(/\[Optable\] visitorId\(\) returned null/);
  });

  test("returns cached passport and decoded visitor id after an edge call populates them", async () => {
    const payload = { id: "vid-xyz" };
    const mockJwt = "h." + btoa(JSON.stringify(payload)) + ".s";
    const fetchSpy = jest.spyOn(window, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ passport: mockJwt }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    const sdk = new OptableSDK({ ...defaultConfig, initPassport: false });
    await sdk.site();

    expect(sdk.passport()).toEqual(mockJwt);
    expect(sdk.visitorId()).toEqual("vid-xyz");
    expect(warnSpy).not.toHaveBeenCalled();

    fetchSpy.mockRestore();
  });

  test("warn-once flag is per-instance", () => {
    const sdk1 = new OptableSDK({ ...defaultConfig, initPassport: false });
    const sdk2 = new OptableSDK({ ...defaultConfig, initPassport: false });

    sdk1.passport();
    sdk2.passport();

    expect(warnSpy).toHaveBeenCalledTimes(2);
  });
});

describe("normalizeTargetingRequest", () => {
  test("normalizes string input", () => {
    const input = "c:123";
    const result = normalizeTargetingRequest(input);
    expect(result).toEqual({ ids: ["c:123"], hids: [] });
  });

  test("normalizes object input", () => {
    const result = normalizeTargetingRequest({});
    expect(result).toEqual({ ids: [], hids: [] });
  });

  test("fails for unknown types", () => {
    expect(() => normalizeTargetingRequest(3)).toThrowError(/Expected string or object/);
  });
});
