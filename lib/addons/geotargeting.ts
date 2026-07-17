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
 * the node is undefined (the host's default node is used).
 *
 * DEFAULT_GEO_MAP reflects one specific provisioning shape: regional edge
 * nodes in US/CA and dedicated per-tenant cloud hosts in AU and the EU. The
 * dedicated hosts only exist for tenants provisioned that way — tenants with
 * a different topology must pass their own GeoMap.
 */

export type GeoMapEntry = [string, string] | [string, string, string];
export type GeoMap = Record<string, GeoMapEntry>;

export interface GeoConfig {
  host: string;
  node: string | undefined;
}

const EU_ENTRY: GeoMapEntry = [".cloud.eu", "-auth.cloud.eu"];

export const DEFAULT_GEO_MAP: GeoMap = {
  AU: [".cloud.au", "-auth.cloud.au"],
  CA: ["-ca.cloud", "-ca-auth.cloud", "ca.edge.optable.co"],
  GB: EU_ENTRY,
  UK: EU_ENTRY,
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
export function getGeoConfig(
  nodeName: string,
  geo: string | undefined,
  geoMap: GeoMap = DEFAULT_GEO_MAP
): GeoConfig | null {
  const entry = geo === undefined ? undefined : geoMap[geo];
  // Array.isArray also rejects inherited Object.prototype members picked up
  // when an unexpected geo like "constructor" is looked up in the map
  if (!Array.isArray(entry)) {
    return null;
  }

  const auth = /-auth$/i.test(nodeName);
  const name = auth ? nodeName.replace(/-auth$/i, "") : nodeName;
  const suffix = auth ? entry[1] : entry[0];
  const edgeHost = entry[2];

  if (edgeHost != null) {
    return { host: edgeHost, node: name + suffix.replace(/\.cloud/, "") };
  }

  return { host: `${name}${suffix}.optable.co`, node: undefined };
}
