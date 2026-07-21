/*
 * The georouting addon maps a visitor's geo (country code) to the Optable edge
 * host that should serve them, so a single SDK bundle can route traffic to the
 * regional edge closest to (and provisioned for) the visitor.
 *
 * Every supported region has its own edge host, so the map is a plain
 * geo → host lookup. The caller supplies the SDK `node`/`site` — this addon
 * only resolves the host.
 *
 * Note on same-region DCNs: the default map assumes one edge host per region.
 * If a customer runs distinct DCNs that share an edge host (e.g. separate US
 * and CA DCNs both on `na.edge`), resolve the host with this addon and select
 * the DCN via `node`/`site` in the SDK config, or pass a custom GeoMap.
 */

export type GeoMap = Record<string, string>;

export const DEFAULT_GEO_MAP: GeoMap = {
  AU: "au.edge.optable.co",
  CA: "ca.edge.optable.co",
  GB: "eu.edge.optable.co",
  UK: "eu.edge.optable.co",
  US: "na.edge.optable.co",
};

/*
 * getGeoRouting() resolves the Optable edge host for a given geo.
 *
 * Returns null when the geo is missing or not present in the map, in which
 * case the caller should skip region-specific initialization.
 */
export function getGeoRouting(geo: string | undefined, geoMap: GeoMap = DEFAULT_GEO_MAP): string | null {
  // hasOwnProperty guards against inherited Object.prototype members being
  // picked up when an unexpected geo like "constructor" is looked up.
  if (geo === undefined || !Object.prototype.hasOwnProperty.call(geoMap, geo)) {
    return null;
  }
  return geoMap[geo];
}
