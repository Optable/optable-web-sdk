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

type PrebidUserSegment = { name: string; value: string };
type PrebidUserSegmentProvider = { id: string; name: string; segment: PrebidUserSegment[] };
type PrebidUserData = PrebidUserSegmentProvider[];

function PrebidUserDataFromCache(config: OptableConfig): PrebidUserData {
  const tdata = TargetingFromCache(config);
  const result = [];

  for (const [key, values] of Object.entries(tdata || {})) {
    const segments = values.map((value) => ({
      name: key,
      value: value,
    }));

    if (segments.length > 0) {
      result.push({
        id: "optable",
        name: "optable",
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
