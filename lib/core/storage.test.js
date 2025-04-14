import { DCN_DEFAULTS } from "../config";
import crypto from "crypto";
import LocalStorage, { deprecatedGenerateCacheKey, generateCacheKey, encodeBase64 } from "./storage";

function randomConfig() {
  const randomHex = crypto.randomBytes(8).toString("hex");
  return {
    host: `host-${randomHex}`,
    site: `site-${randomHex}`,
    consent: DCN_DEFAULTS.consent,
  };
}

describe("LocalStorage", () => {
  test("allows to store and retrieve a passport", () => {
    const store = new LocalStorage(randomConfig());
    expect(store.getPassport()).toBeNull();
    store.setPassport("abc");
    expect(store.getPassport()).toEqual("abc");
    store.clearPassport();
    expect(store.getPassport()).toBeNull();
  });

  test("allows to store and retrieve targeting", () => {
    const store = new LocalStorage(randomConfig());
    expect(store.getTargeting()).toBeNull();
    store.setTargeting({ user: [], audience: [] });
    expect(store.getTargeting()).toEqual({ user: [], audience: [] });
    store.clearTargeting();
    expect(store.getTargeting()).toBeNull();
  });

  test("allows to set targeting with empty value", () => {
    const store = new LocalStorage(randomConfig());
    expect(store.setTargeting());
    expect(store.getTargeting()).toBeNull();
  });

  test("allows to store and retrieve a site config", () => {
    const store = new LocalStorage(randomConfig());
    expect(store.getSite()).toBeNull();
    const config = { auctionConfigURL: "", getTopicsURL: "", interestGroupPixel: "" };
    store.setSite(config);
    expect(store.getSite()).toEqual(config);
    store.clearSite();
    expect(store.getSite()).toBeNull();
  });

  test("allows to set site with empty value", () => {
    const store = new LocalStorage(randomConfig());
    expect(store.setSite());
    expect(store.getSite()).toBeNull();
  });

  test("reads from deprecated cache if new cache is empty but only writes to new cache", () => {
    const config = randomConfig();
    const store = new LocalStorage(config);
    const deprecatedKey = `OPTABLE_PASS_${deprecatedGenerateCacheKey(config)}`;
    const newKey = `OPTABLE_PASSPORT_${generateCacheKey(config)}`;

    localStorage.setItem(deprecatedKey, "deprecated-value");
    expect(store.getPassport()).toEqual("deprecated-value");

    store.setPassport("new-value");
    expect(store.getPassport()).toEqual("new-value");
    expect(localStorage.getItem(newKey)).toEqual("new-value");
    expect(localStorage.getItem(deprecatedKey)).toEqual("deprecated-value");

    localStorage.removeItem(deprecatedKey);
    localStorage.removeItem(newKey);
  });

  test("prioritizes new cache over deprecated cache", () => {
    const config = randomConfig();
    const store = new LocalStorage(config);
    const deprecatedKey = `OPTABLE_PASS_${deprecatedGenerateCacheKey(config)}`;
    const newKey = `OPTABLE_PASSPORT_${generateCacheKey(config)}`;

    localStorage.setItem(deprecatedKey, "deprecated-value");
    localStorage.setItem(newKey, "new-value");
    expect(store.getPassport()).toEqual("new-value");

    localStorage.removeItem(deprecatedKey);
    localStorage.removeItem(newKey);
  });

  test("persists pair ids from targeting responses", () => {
    const store = new LocalStorage(randomConfig());
    expect(
      store.setTargeting({
        ortb2: {
          user: {
            eids: [
              { source: "pair-protocol.com", uids: [{ id: "pair1" }] },
              { source: "pair-protocol.com", uids: [{ id: "pair1" }, { id: "pair2" }] },
              { source: "unrelated.test", uids: [{ id: "pair3" }] },
            ],
          },
        },
      })
    );
    expect(store.storage.getItem("_optable_pairId")).toBe(btoa(JSON.stringify({ envelope: ["pair1", "pair2"] })));
    expect(store.getPairIDs()).toEqual(["pair1", "pair2"]);
  });
});

describe("Cache Key Generation", () => {
  const mockConfig = (overrides = {}) => ({
    host: "example.com",
    site: "test-site",
    node: "node123",
    legacyHostCache: "legacy.example.com",
    ...overrides,
  });

  test("deprecatedGenerateCacheKey uses legacyHostCache if present", () => {
    const config = mockConfig();
    const expectedKey = encodeBase64(`${config.legacyHostCache}/${config.site}`);
    expect(deprecatedGenerateCacheKey(config)).toEqual(expectedKey);
  });

  test("deprecatedGenerateCacheKey falls back to host if legacyHostCache is missing", () => {
    const config = mockConfig({ legacyHostCache: undefined });
    const expectedKey = encodeBase64(`${config.host}/${config.site}`);
    expect(deprecatedGenerateCacheKey(config)).toEqual(expectedKey);
  });

  test("generateCacheKey uses host and node if node exists", () => {
    const config = mockConfig();
    const expectedKey = encodeBase64(`${config.host}/${config.node}`);
    expect(generateCacheKey(config)).toEqual(expectedKey);
  });

  test("generateCacheKey falls back to host if node is missing", () => {
    const config = mockConfig({ node: undefined });
    const expectedKey = encodeBase64(config.host);
    expect(generateCacheKey(config)).toEqual(expectedKey);
  });
});
