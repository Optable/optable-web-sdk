import { getGeoRouting, DEFAULT_GEO_MAP } from "./geo-routing.ts";

describe("getGeoRouting", () => {
  test("resolves the edge host for each supported region", () => {
    expect(getGeoRouting("NA")).toBe("na.edge.optable.co");
    expect(getGeoRouting("CA")).toBe("ca.edge.optable.co");
    expect(getGeoRouting("EU")).toBe("eu.edge.optable.co");
    expect(getGeoRouting("AU")).toBe("au.edge.optable.co");
  });

  test("returns null for an unsupported region", () => {
    expect(getGeoRouting("SA")).toBeNull();
  });

  test("returns null for a missing region", () => {
    expect(getGeoRouting("")).toBeNull();
    expect(getGeoRouting(undefined)).toBeNull();
  });

  test("returns null for regions inherited from Object.prototype", () => {
    expect(getGeoRouting("constructor")).toBeNull();
    expect(getGeoRouting("__proto__")).toBeNull();
    expect(getGeoRouting("toString")).toBeNull();
  });

  test("is case-sensitive on the region key", () => {
    expect(getGeoRouting("na")).toBeNull();
  });

  test("accepts a custom geo map", () => {
    const geoMap = { SA: "sa.edge.optable.co" };
    expect(getGeoRouting("SA", geoMap)).toBe("sa.edge.optable.co");
    expect(getGeoRouting("NA", geoMap)).toBeNull();
  });

  test("exposes the default geo map", () => {
    expect(DEFAULT_GEO_MAP.NA).toBe("na.edge.optable.co");
    expect(DEFAULT_GEO_MAP.CA).toBe("ca.edge.optable.co");
    expect(DEFAULT_GEO_MAP.EU).toBe("eu.edge.optable.co");
    expect(DEFAULT_GEO_MAP.AU).toBe("au.edge.optable.co");
  });
});
