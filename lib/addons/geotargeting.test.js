import { getGeoConfig, DEFAULT_GEO_MAP } from "./geotargeting.ts";

describe("getGeoConfig", () => {
  test("resolves the regional edge host and node for US", () => {
    expect(getGeoConfig("acme", "US")).toEqual({
      host: "na.edge.optable.co",
      node: "acme",
    });
  });

  test("resolves the auth node for US", () => {
    expect(getGeoConfig("acme-auth", "US")).toEqual({
      host: "na.edge.optable.co",
      node: "acme-auth",
    });
  });

  test("resolves the regional edge host and node for CA", () => {
    expect(getGeoConfig("acme", "CA")).toEqual({
      host: "ca.edge.optable.co",
      node: "acme-ca",
    });
  });

  test("resolves the auth node for CA", () => {
    expect(getGeoConfig("acme-auth", "CA")).toEqual({
      host: "ca.edge.optable.co",
      node: "acme-ca-auth",
    });
  });

  test("resolves a dedicated cloud host with null node for AU", () => {
    expect(getGeoConfig("acme", "AU")).toEqual({
      host: "acme.cloud.au.optable.co",
      node: null,
    });
  });

  test("resolves a dedicated auth cloud host with null node for AU", () => {
    expect(getGeoConfig("acme-auth", "AU")).toEqual({
      host: "acme-auth.cloud.au.optable.co",
      node: null,
    });
  });

  test("resolves GB and UK to the same EU cloud host", () => {
    const expected = { host: "acme.cloud.eu.optable.co", node: null };
    expect(getGeoConfig("acme", "GB")).toEqual(expected);
    expect(getGeoConfig("acme", "UK")).toEqual(expected);
  });

  test("returns null for an unsupported geo", () => {
    expect(getGeoConfig("acme", "FR")).toBeNull();
  });

  test("returns null for a missing geo", () => {
    expect(getGeoConfig("acme", "")).toBeNull();
    expect(getGeoConfig("acme", undefined)).toBeNull();
  });

  test("only treats a trailing -auth as the auth variant", () => {
    expect(getGeoConfig("author-press", "US")).toEqual({
      host: "na.edge.optable.co",
      node: "author-press",
    });
  });

  test("accepts a custom geo map", () => {
    const geoMap = {
      BR: ["-br.cloud", "-br-auth.cloud", "sa.edge.optable.co"],
      MX: [".cloud.mx", "-auth.cloud.mx"],
    };
    expect(getGeoConfig("acme", "BR", geoMap)).toEqual({
      host: "sa.edge.optable.co",
      node: "acme-br",
    });
    expect(getGeoConfig("acme-auth", "MX", geoMap)).toEqual({
      host: "acme-auth.cloud.mx.optable.co",
      node: null,
    });
    expect(getGeoConfig("acme", "US", geoMap)).toBeNull();
  });

  test("exposes the default geo map", () => {
    expect(DEFAULT_GEO_MAP.US).toEqual([".cloud", "-auth.cloud", "na.edge.optable.co"]);
    expect(DEFAULT_GEO_MAP.CA).toEqual(["-ca.cloud", "-ca-auth.cloud", "ca.edge.optable.co"]);
  });
});
