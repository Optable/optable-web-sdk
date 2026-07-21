import { getGeoRouting, DEFAULT_GEO_MAP } from "./georouting.ts";

describe("getGeoRouting", () => {
  test("resolves the edge host for each supported region", () => {
    expect(getGeoRouting("US")).toBe("na.edge.optable.co");
    expect(getGeoRouting("CA")).toBe("ca.edge.optable.co");
    expect(getGeoRouting("AU")).toBe("au.edge.optable.co");
  });

  test("resolves GB and UK to the same EU edge host", () => {
    expect(getGeoRouting("GB")).toBe("eu.edge.optable.co");
    expect(getGeoRouting("UK")).toBe("eu.edge.optable.co");
  });

  test("returns null for an unsupported geo", () => {
    expect(getGeoRouting("FR")).toBeNull();
  });

  test("returns null for a missing geo", () => {
    expect(getGeoRouting("")).toBeNull();
    expect(getGeoRouting(undefined)).toBeNull();
  });

  test("returns null for geos inherited from Object.prototype", () => {
    expect(getGeoRouting("constructor")).toBeNull();
    expect(getGeoRouting("__proto__")).toBeNull();
    expect(getGeoRouting("toString")).toBeNull();
  });

  test("is case-sensitive on the geo key", () => {
    expect(getGeoRouting("us")).toBeNull();
  });

  test("accepts a custom geo map", () => {
    const geoMap = {
      BR: "sa.edge.optable.co",
      MX: "na.edge.optable.co",
    };
    expect(getGeoRouting("BR", geoMap)).toBe("sa.edge.optable.co");
    expect(getGeoRouting("MX", geoMap)).toBe("na.edge.optable.co");
    expect(getGeoRouting("US", geoMap)).toBeNull();
  });

  test("exposes the default geo map", () => {
    expect(DEFAULT_GEO_MAP.US).toBe("na.edge.optable.co");
    expect(DEFAULT_GEO_MAP.CA).toBe("ca.edge.optable.co");
    expect(DEFAULT_GEO_MAP.GB).toBe("eu.edge.optable.co");
    expect(DEFAULT_GEO_MAP.AU).toBe("au.edge.optable.co");
  });
});
