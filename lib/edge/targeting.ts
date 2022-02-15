import type { OptableConfig } from "../config";
import { fetch } from "../core/network";
import { LocalStorage } from "../core/storage";

type TargetingKeyValues = {
  [key: string]: string[];
};

async function Targeting(config: OptableConfig): Promise<TargetingKeyValues> {
  const response: TargetingKeyValues = await fetch("/targeting", config, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (response) {
    const ls = new LocalStorage(config);
    ls.setTargeting(response);
  }

  return response;
}

function TargetingFromCache(config: OptableConfig): TargetingKeyValues | null {
  const ls = new LocalStorage(config);
  return ls.getTargeting();
}

function TargetingClearCache(config: OptableConfig) {
  const ls = new LocalStorage(config);
  ls.clearTargeting();
}

type PrebidUserSegment = { id: string };
type PrebidSegtax = { segtax: number };
type PrebidUserSegmentProvider = { name: string; ext: PrebidSegtax; segment: PrebidUserSegment[] };
type PrebidUserData = PrebidUserSegmentProvider[];

/*
 * Prebid.js supports passing seller-defined audiences to compatible
 * bidder adapters.
 *
 * We return the contents to be pushed to ortb2.user.data and passed to
 * bidder adapters via setConfig(ortb2.user.data)... the caller is free
 * to append additional objects before setting the final result.
 *
 * References:
 * https://docs.prebid.org/features/firstPartyData.html#segments-and-taxonomy
 * https://iabtechlab.com/wp-content/uploads/2021/03/IABTechLab_Taxonomy_and_Data_Transparency_Standards_to_Support_Seller-defined_Audience_and_Context_Signaling_2021-03.pdf
 */
function PrebidUserDataFromCache(config: OptableConfig): PrebidUserData {
  const tdata = TargetingFromCache(config);
  const result = [];

  for (const [_, values] of Object.entries(tdata || {})) {
    const segments = values.map((value) => ({
      id: value,
    }));

    if (segments.length > 0) {
      result.push({
        name: "optable.co",
        /*
         * 5001 is Optable Private Member Defined Audiences
         * See: https://github.com/InteractiveAdvertisingBureau/openrtb/pull/81
         */
        ext: { segtax: 5001 },
        segment: segments,
      });
    }
  }

  return result;
}

export {
  Targeting,
  TargetingFromCache,
  TargetingClearCache,
  TargetingKeyValues,
  PrebidUserDataFromCache,
  PrebidUserData,
};
export default Targeting;
