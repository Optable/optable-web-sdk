# Geo-routing Addon

This addon maps a visitor's region code to the Optable edge host that should serve them, so a single SDK bundle can route traffic to the regional edge closest to — and provisioned for — the visitor.

It is a pure lookup. It performs no network calls, does no geolocation of its own, and has no side effects.

## Usage

```js
import { getGeoRouting } from "@optable/web-sdk/lib/dist/addons/geo-routing";

const host = getGeoRouting(visitorRegion); // "na.edge.optable.co" for "US"
if (host) {
  const sdk = new OptableSDK({ host, node: "my-node", site: "my-site" });
}
```

`getGeoRouting` returns `null` when the region is missing or unsupported. Either skip region-specific initialization, or fall back to a configured default:

```js
const host = getGeoRouting(visitorRegion) ?? "na.edge.optable.co";
```

## Supported regions

| Region code | Edge host            |
| ----------- | -------------------- |
| `AU`        | `au.edge.optable.co` |
| `CA`        | `ca.edge.optable.co` |
| `EU`        | `eu.edge.optable.co` |
| `NA`        | `na.edge.optable.co` |
| `US`        | `na.edge.optable.co` |

`US` and `NA` are aliases for the same North America edge.

## Custom region maps

Pass a `GeoMap` as the second argument to support region codes outside the default set, or to point them at different hosts:

```js
import { getGeoRouting, DEFAULT_GEO_MAP } from "@optable/web-sdk/lib/dist/addons/geo-routing";

const host = getGeoRouting(visitorRegion, {
  ...DEFAULT_GEO_MAP,
  UK: "eu.edge.optable.co",
  JP: "ap.edge.optable.co",
});
```

Lookups use `Object.prototype.hasOwnProperty`, so an unexpected region such as `"constructor"` resolves to `null` rather than picking up an inherited `Object.prototype` member.

## Resolving the region code

**Translating a country to a supported region code is the caller's responsibility.** The addon knows regions, not the full country-to-region table, and does not detect the visitor's location. Supply the code from whatever source the page already has — a CDN geo header, a CMP, or a publisher-set global:

```js
const host = getGeoRouting(window.optable?.countryCode);
```

The addon also resolves only the host. The SDK `node` and `site` are separate configuration and must be supplied by the caller.

## API

| Export            | Signature                                                          | Description                                                                                         |
| ----------------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| `getGeoRouting`   | `(region: string \| undefined, geoMap?: GeoMap) => string \| null` | Resolves the edge host for a region code. `null` when the region is missing or absent from the map. |
| `DEFAULT_GEO_MAP` | `GeoMap`                                                           | The built-in region-to-host table. Spread it to extend rather than replace it.                      |
| `GeoMap`          | `Record<string, string>`                                           | Type alias for a region-code-to-host map.                                                           |
