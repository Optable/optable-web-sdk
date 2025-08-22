import type { ResolvedConfig, ABTestConfig, MatcherOverride } from "../config";
import { fetch } from "../core/network";
import { LocalStorage } from "../core/storage";
import * as ortb2 from "iab-openrtb/v26";
import * as adcom from "iab-adcom";
import { sendTargetingUpdateEvent } from "../core/events/cache-refresh";

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

type TargetingRequest = {
  ids: string[];
  hids: string[];
};

type TargetingResponse = {
  audience?: AudienceIdentifiers[];
  user?: UserIdentifiers[];
  ortb2: { user: ortb2.User };
  // Identifiers that matched and were used to generate the targeting response.
  resolved_ids?: string[];
};

// Determine which A/B test (if any) should be used for this request
function determineABTest(abTests?: ABTestConfig[]): ABTestConfig | null {
  if (!abTests || abTests.length === 0) {
    return null;
  }

  // Skip A/B testing if traffic percentage sum exceeds 100%
  const totalTrafficPercentage = abTests.reduce((sum, test) => sum + test.trafficPercentage, 0);
  if (totalTrafficPercentage > 100) {
    console.error(`AB Test Config Error: Traffic Percentage Sum Exceeds 100%`);
    return null;
  }

  // Simple random number 0-99
  const bucket = Math.floor(Math.random() * 100);
  let cumulative = 0;
  for (const test of abTests) {
    cumulative += test.trafficPercentage;
    if (bucket < cumulative) {
      return test;
    }
  }
  return null;
}

async function Targeting(config: ResolvedConfig, req: TargetingRequest): Promise<TargetingResponse> {
  const searchParams = new URLSearchParams();
  req.ids.forEach((id) => searchParams.append("id", id));
  req.hids.forEach((id) => searchParams.append("hid", id));
  const abTest = determineABTest(config.abTests);
  if (abTest) {
    searchParams.append("ab_test_id", abTest.id);
    if (abTest.matcher_override) {
      // Sort by rank to ensure proper order
      const sortedOverrides = [...abTest.matcher_override].sort((a, b) => a.rank - b.rank);
      sortedOverrides.forEach((override) => {
        searchParams.append("matcher_override", override.id);
      });
    }
  }

  if (config.additionalTargetingSignals?.ref) {
    searchParams.append("ref", `${window.location.protocol}//${window.location.host}${window.location.pathname}`);
  }

  const path = "/v2/targeting?" + searchParams.toString();

  const response: TargetingResponse = await fetch(path, config, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  if (response) {
    const ls = new LocalStorage(config);
    ls.setTargeting(response);
    sendTargetingUpdateEvent(config, response);
  }

  return response;
}

function TargetingFromCache(config: ResolvedConfig): TargetingResponse | null {
  const ls = new LocalStorage(config);
  return ls.getTargeting();
}

function TargetingClearCache(config: ResolvedConfig) {
  const ls = new LocalStorage(config);
  ls.clearTargeting();
}

// Prebid.js supports setting ortb2 object for compatible bidder adapters.
//
// We return the contents to be merged in ortb2 and passed to
// bidder adapters via mergeConfig(ortb2)... the caller is free
// to append additional objects before setting the final result.
//
// References:
// https://docs.prebid.org/features/firstPartyData.html#segments-and-taxonomy
// https://iabtechlab.com/wp-content/uploads/2021/03/IABTechLab_Taxonomy_and_Data_Transparency_Standards_to_Support_Seller-defined_Audience_and_Context_Signaling_2021-03.pdf
//
// Deprecated: prefer the ortb2 field in the targeting response.
type PrebidORTB2 = { user: ortb2.User };

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
          uids: identifiers.ids.map(({ id }) => ({ id, atype: adcom.AgentType.PERSON_BASED })),
        })),
      },
    },
  };
}

type TargetingKeyValues = Record<string, string[]>;

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

export { Targeting, TargetingFromCache, TargetingClearCache, PrebidORTB2, TargetingKeyValues, determineABTest };
export default Targeting;
export type { TargetingResponse, TargetingRequest, ABTestConfig, MatcherOverride };
