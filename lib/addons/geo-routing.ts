/*
 * The geo-routing addon maps a visitor's region code to the Optable edge host
 * that should serve them, so a single SDK bundle can route traffic to the
 * regional edge closest to (and provisioned for) the visitor.
 *
 * Keys are region codes that map to Optable edge hosts (`US` and `NA` are
 * aliases for the North America edge). Translating a visitor's country code to
 * a supported key is the caller's responsibility — the addon deliberately
 * knows only regions, not the full country-to-region table. The caller also
 * supplies the SDK `node`/`site`; this addon only resolves the host.
 */

export type GeoMap = Record<string, string>;

export const DEFAULT_GEO_MAP: GeoMap = {
  AU: "au.edge.optable.co",
  CA: "ca.edge.optable.co",
  EU: "eu.edge.optable.co",
  NA: "na.edge.optable.co",
  US: "na.edge.optable.co",
};

/*
 * getGeoRouting() resolves the Optable edge host for a given region code.
 *
 * Returns null when the region is missing or not present in the map, in which
 * case the caller should skip region-specific initialization.
 */
export function getGeoRouting(region: string | undefined, geoMap: GeoMap = DEFAULT_GEO_MAP): string | null {
  // hasOwnProperty guards against inherited Object.prototype members being
  // picked up when an unexpected region like "constructor" is looked up.
  if (region === undefined || !Object.prototype.hasOwnProperty.call(geoMap, region)) {
    return null;
  }
  return geoMap[region];
}
