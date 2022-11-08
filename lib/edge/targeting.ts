import type { OptableConfig } from "../config";
import { fetch } from "../core/network";
import { LocalStorage } from "../core/storage";

type AudienceProvider = "optable.co"
type UserProvider = "optable.co" | "uidapi.com"

type Identifier = {
  id: string;
};

type AudienceIdentifiers = {
  ids: Identifier[];
  provider: AudienceProvider;
  rtb_segtax: number; // taxonomy identifier for RTB UserSegments
  keyspace?: string;   // GAM targeting key for optable.co audience provider
}

type UserIdentifiers = {
  ids: Identifier[];
  provider: UserProvider;
}

type TargetingResponse = {
  audience?: AudienceIdentifiers[];
  user?: UserIdentifiers[];
};

async function Targeting(config: OptableConfig): Promise<TargetingResponse> {
  const response: TargetingResponse = await fetch("/v2/targeting", config, {
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

function TargetingFromCache(config: OptableConfig): TargetingResponse | null {
  const ls = new LocalStorage(config);
  return ls.getTargeting();
}

function TargetingClearCache(config: OptableConfig) {
  const ls = new LocalStorage(config);
  ls.clearTargeting();
}

type PrebidUserSegment = Identifier
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
function PrebidUserData(tdata: TargetingResponse | null): PrebidUserData {
  return (tdata?.audience ?? []).map((identifiers) => ({
    name: identifiers.provider,
    segment: identifiers.ids,
    ext: { segtax: identifiers.rtb_segtax },
  }))
}

type TargetingKeyValues = { [key: string]: string[] };
function TargetingKeyValues(tdata: TargetingResponse | null): TargetingKeyValues {
  const result: TargetingKeyValues = {}

  if (!tdata) {
    return result;
  }

  for (const identifiers of (tdata.audience ?? [])) {
    if (identifiers.keyspace) {
      if (!(identifiers.keyspace in result)) {
        result[identifiers.keyspace] = []
      }
      result[identifiers.keyspace].push(...identifiers.ids.map((el) => el.id))
    }
  }

  return result;
}

export {
  Targeting,
  TargetingFromCache,
  TargetingClearCache,
  TargetingResponse,
  PrebidUserData,
  TargetingKeyValues,
};
export default Targeting;
