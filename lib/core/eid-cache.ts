import type { TargetingResponse } from "../edge/targeting";
import type { EID } from "iab-openrtb/v26";

interface EidCacheConfig {
  enabled: boolean;
  ttl?: Record<string, number>;
  storageKey?: string;
  timestampKey?: string;
}

const DEFAULT_TTL: Record<string, number> = {
  "uidapi.com": 1 * 24 * 60 * 60 * 1000,
  "id5-sync.com": 7 * 24 * 60 * 60 * 1000,
  default: 3 * 24 * 60 * 60 * 1000,
};

const DEFAULT_STORAGE_KEY = "OPTABLE_RESOLVED";
const DEFAULT_TIMESTAMP_KEY = "OPTABLE_TIMESTAMPS";

function getKey(eid: EID): string {
  return `${eid.matcher}::${eid.source}`;
}

function getTTL(source: string, config: EidCacheConfig): number {
  return config.ttl?.[source] ?? DEFAULT_TTL[source] ?? DEFAULT_TTL.default;
}

function readFromStorage(key: string): any {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeToStorage(key: string, value: any): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Silent failure on storage errors
  }
}

export function mergeWithCache(freshResponse: TargetingResponse, config: EidCacheConfig): TargetingResponse {
  if (!config.enabled) {
    return freshResponse;
  }

  const storageKey = config.storageKey ?? DEFAULT_STORAGE_KEY;
  const timestampKey = config.timestampKey ?? DEFAULT_TIMESTAMP_KEY;

  const cached = readFromStorage(storageKey) ?? { ortb2: { user: { eids: [] } } };
  const timestamps = readFromStorage(timestampKey) ?? {};

  const now = Date.now();
  const eidMap = new Map<string, EID>();

  const cachedEids: EID[] = cached?.ortb2?.user?.eids ?? [];
  const freshEids: EID[] = freshResponse?.ortb2?.user?.eids ?? [];

  const freshKeys = new Set(freshEids.map(getKey));

  for (const eid of cachedEids) {
    if (!eid.uids?.length) {
      continue;
    }

    const key = getKey(eid);

    if (freshKeys.has(key)) {
      continue;
    }

    const ts = timestamps[key];
    const expiry = getTTL(eid.source, config);

    if (!ts) {
      timestamps[key] = now;
      eidMap.set(key, eid);
    } else if (now - ts < expiry) {
      eidMap.set(key, eid);
    } else {
      delete timestamps[key];
    }
  }

  for (const eid of freshEids) {
    if (!eid.uids?.length) {
      continue;
    }

    const key = getKey(eid);
    eidMap.set(key, eid);
    timestamps[key] = now;
  }

  const mergedEids: EID[] = [];
  const validTimestamps: Record<string, number> = {};

  eidMap.forEach((eid, key) => {
    mergedEids.push(eid);
    validTimestamps[key] = timestamps[key];
  });

  const mergedResponse: TargetingResponse = {
    ...freshResponse,
    ortb2: {
      ...freshResponse.ortb2,
      user: {
        ...freshResponse.ortb2?.user,
        eids: mergedEids,
      },
    },
  };

  writeToStorage(storageKey, {
    ortb2: {
      user: {
        data: freshResponse.ortb2?.user?.data,
        eids: mergedEids,
      },
    },
  });

  writeToStorage(timestampKey, validTimestamps);

  return mergedResponse;
}

export type { EidCacheConfig };
