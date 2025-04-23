import { DCN_DEFAULTS } from "../config";
import crypto from "crypto";
import LocalStorage from "./storage";

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

  test("targeting also writes to public key", () => {
    const store = new LocalStorage({ ...randomConfig(), optableCacheTargeting: "my_public_key" });
    expect(store.storage.getItem("my_public_key")).toBeNull();
    store.setTargeting({ ortb2: { prop1: "some-value" } });
    expect(store.storage.getItem("my_public_key")).toEqual(JSON.stringify({ ortb2: { prop1: "some-value" } }));
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
