/*
 * The geotargeting addon maps a visitor's geo (country code) to the Optable
 * host and node that should serve them, so that a single SDK bundle can route
 * traffic to region-specific DCNs.
 *
 * A GeoMap entry is a tuple of host fragments keyed by country code:
 *   [0] — host suffix for the standard (non-auth) node
 *   [1] — host suffix for the auth node
 *   [2] — optional regional edge host shared by multiple nodes
 *
 * When a regional edge host ([2]) is present, it is used as the host and the
 * node name is derived from the tenant name plus the suffix with ".cloud"
 * removed (e.g. "acme" + "-ca-auth" → "acme-ca-auth"). Otherwise the tenant
 * runs on a dedicated cloud host built as `${name}${suffix}.optable.co` and
 * the node is null (the host's default node is used).
 */

export type GeoMapEntry = [string, string] | [string, string, string];
export type GeoMap = Record<string, GeoMapEntry>;

export interface GeoConfig {
  host: string;
  node: string | null;
}

export const DEFAULT_GEO_MAP: GeoMap = {
  AU: [".cloud.au", "-auth.cloud.au"],
  CA: ["-ca.cloud", "-ca-auth.cloud", "ca.edge.optable.co"],
  GB: [".cloud.eu", "-auth.cloud.eu"],
  UK: [".cloud.eu", "-auth.cloud.eu"],
  US: [".cloud", "-auth.cloud", "na.edge.optable.co"],
};

/*
 * getGeoConfig() resolves the host and node for a node name in a given geo.
 *
 * nodeName is the tenant name, optionally with an "-auth" suffix selecting the
 * auth variant of the node (e.g. "acme" or "acme-auth").
 *
 * Returns null when the geo is missing or not present in the map, in which
 * case the caller should skip region-specific initialization.
 */
export function getGeoConfig(nodeName: string, geo: string, geoMap: GeoMap = DEFAULT_GEO_MAP): GeoConfig | null {
  const entry = geoMap[geo];
  if (!entry) {
    return null;
  }

  const auth = /-auth$/i.test(nodeName);
  const name = auth ? nodeName.replace(/-auth$/i, "") : nodeName;
  const suffix = auth ? entry[1] : entry[0];
  const edgeHost = entry[2];

  if (edgeHost != null) {
    return { host: edgeHost, node: name + suffix.replace(/\.cloud/, "") };
  }

  return { host: `${name}${suffix}.optable.co`, node: null };
}
