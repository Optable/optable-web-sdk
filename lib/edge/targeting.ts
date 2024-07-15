import type { OptableConfig } from "../config";
import { fetch } from "../core/network";
import { LocalStorage } from "../core/storage";
import { UIDAgentType, User as RTB2User } from "./rtb2";

type Identifier = {
  id: string;
};

type AudienceIdentifiers = {
  ids: Identifier[];
  provider: string;
  rtb_segtax: number; // taxonomy identifier for RTB UserSegments
  keyspace?: string; // targeting key for integrations allowing for key/values targeting
};

type UserIdentifiers = {
  ids: Identifier[];
  provider: string;
};

type TargetingResponse = {
  audience?: AudienceIdentifiers[];
  user?: UserIdentifiers[];
};

const lmpidProvider = "loblawmedia.ca";

async function Targeting(config: Required<OptableConfig>, id: string): Promise<TargetingResponse> {
  const searchParams = new URLSearchParams({ id });
  const path = "/v2/targeting?" + searchParams.toString();

  const response: TargetingResponse = await fetch(path, config, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  if (response) {
    const ls = new LocalStorage(config);
    ls.setTargeting(response);
  }

  return response;
}

function LmpidFromCache(config: Required<OptableConfig>): string | null {
  const ls = new LocalStorage(config);
  return ls.getLmpid();
}

function TargetingFromCache(config: Required<OptableConfig>): TargetingResponse | null {
  const ls = new LocalStorage(config);
  return ls.getTargeting();
}

function TargetingClearCache(config: Required<OptableConfig>) {
  const ls = new LocalStorage(config);
  ls.clearTargeting();
}

type PrebidORTB2 = { user?: RTB2User };

/*
 * Prebid.js supports passing seller-defined audiences to compatible
 * bidder adapters.
 *
 * We return the contents to be merged in ortb2 and passed to
 * bidder adapters via mergeConfig(ortb2)... the caller is free
 * to append additional objects before setting the final result.
 *
 * References:
 * https://docs.prebid.org/features/firstPartyData.html#segments-and-taxonomy
 * https://iabtechlab.com/wp-content/uploads/2021/03/IABTechLab_Taxonomy_and_Data_Transparency_Standards_to_Support_Seller-defined_Audience_and_Context_Signaling_2021-03.pdf
 */
function PrebidORTB2(tdata: TargetingResponse | null): PrebidORTB2 {
  return {
    user: {
      data: (tdata?.audience ?? []).map((identifiers) => ({
        name: identifiers.provider,
        segment: identifiers.ids,
        ext: { segtax: identifiers.rtb_segtax },
      })),
      ext: {
        eids: (tdata?.user ?? []).map((identifiers) => ({
          source: identifiers.provider,
          uids: identifiers.ids.map(({ id }) => ({ id, atype: UIDAgentType.PersonID })),
        })),
      },
    },
  };
}

type TargetingKeyValues = { [key: string]: string[] };
function TargetingKeyValues(tdata: TargetingResponse | null): TargetingKeyValues {
  const result: TargetingKeyValues = {};

  if (!tdata) {
    return result;
  }

  for (const identifiers of tdata.audience ?? []) {
    if (identifiers.keyspace) {
      if (!(identifiers.keyspace in result)) {
        result[identifiers.keyspace] = [];
      }
      result[identifiers.keyspace].push(...identifiers.ids.map((el) => el.id));
    }
  }

  return result;
}

export {
  Targeting,
  TargetingFromCache,
  TargetingClearCache,
  TargetingResponse,
  PrebidORTB2,
  TargetingKeyValues,
  LmpidFromCache,
  lmpidProvider,
};
export default Targeting;
