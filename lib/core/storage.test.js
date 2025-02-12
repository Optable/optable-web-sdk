import { DCN_DEFAULTS } from "../config";
import LocalStorage from "./storage";
import crypto from "crypto";

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
});
