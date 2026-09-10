// Merges a fresh targeting or tokenize response into a wrapper's rolling EID
// cache. Merge rules are documented in eid-cache.md; inputs are never mutated.

// UID2 refresh material: the refresh response body, also carried in the
// targeting response refs map and on a cached EID's _ref.
type Uid2RefData = {
  advertising_token: string;
  refresh_token: string;
  refresh_response_key: string;
  refresh_from: number;
  refresh_expires: number;
  identity_expires: number;
};

type CachedEid = {
  source: string;
  uids?: Array<{
    id?: string;
    atype?: number;
    ext?: { optable?: { ref?: string | number } };
  }>;
  // UID2 refresh material resolved from the response refs map. Cache-only:
  // the RTD module strips it before EIDs reach bid requests.
  _ref?: Uid2RefData;
};

type ResolvedCache = {
  ortb2?: { user?: { data?: unknown[]; eids?: CachedEid[] } };
  refs?: Record<string, unknown>;
};

const UID2_SOURCE = "uidapi.com";
const DEFAULT_MAX_UIDS_PER_EID = 2;

export function isUid2RefData(value: unknown): value is Uid2RefData {
  const v = value as Record<string, unknown> | null | undefined;
  return (
    !!v &&
    typeof v.advertising_token === "string" &&
    typeof v.refresh_token === "string" &&
    typeof v.refresh_response_key === "string" &&
    typeof v.refresh_from === "number" &&
    typeof v.refresh_expires === "number" &&
    typeof v.identity_expires === "number"
  );
}

// The validated ref data an EID points at via uids[0].ext.optable.ref.
// Own-property lookup only: an inherited key like "constructor" must not resolve.
function refFor(eid: CachedEid, refs?: Record<string, unknown>): Uid2RefData | undefined {
  if (!refs) return undefined;
  const refKey = eid.uids?.[0]?.ext?.optable?.ref;
  if (refKey === undefined || !Object.prototype.hasOwnProperty.call(refs, refKey)) return undefined;
  const ref = refs[refKey];
  return isUid2RefData(ref) ? ref : undefined;
}

// Stamps validated ref data (UID2 refresh tokens) from the response refs map
// onto each EID as _ref, in place.
export function resolveRefs(eids: CachedEid[], refs?: Record<string, unknown>): void {
  eids.forEach((eid) => {
    const ref = refFor(eid, refs);
    if (ref) {
      eid._ref = ref;
    }
  });
}

// The EID's ref data when it is usable for a refresh, else null.
export function getRefData(eid: CachedEid): Uid2RefData | null {
  return eid._ref?.refresh_token && eid._ref?.refresh_response_key ? eid._ref : null;
}

// UID2 tokens carry a refresh_from timestamp; past it they need refreshing.
export function isUid2Stale(eid: CachedEid): boolean {
  const ref = getRefData(eid);
  if (!ref) return false;
  return Date.now() > (ref.refresh_from || 0);
}

export function mergeCache(
  newObj: ResolvedCache | null | undefined,
  oldObj: ResolvedCache | null | undefined,
  options?: { maxUidsPerEid?: number }
): { merged: ResolvedCache; staleUid2s: CachedEid[] } {
  const oldEids = oldObj?.ortb2?.user?.eids || [];
  const newEids = newObj?.ortb2?.user?.eids || [];
  const maxUids = options?.maxUidsPerEid ?? DEFAULT_MAX_UIDS_PER_EID;

  const copyOf = (eid: CachedEid): CachedEid => ({ ...eid, uids: (eid.uids || []).slice(0, maxUids) });

  const newSources = new Set(newEids.map((e) => e.source));
  const eidMap = new Map<string, CachedEid>();
  const staleUid2s: CachedEid[] = [];

  // Carry over old EIDs whose source is not in the new response, keeping
  // their existing _ref.
  oldEids.forEach((eid) => {
    if (!eid.uids?.length) return;
    if (!newSources.has(eid.source)) {
      eidMap.set(eid.source, copyOf(eid));
    }
  });

  // New EIDs overwrite old ones with the same source.
  newEids.forEach((eid) => {
    if (!eid.uids?.length) return;
    const copy = copyOf(eid);
    const ref = refFor(eid, newObj?.refs);
    if (ref) {
      copy._ref = ref;
    }
    eidMap.set(eid.source, copy);
  });

  const mergedEids: CachedEid[] = [];
  eidMap.forEach((eid) => {
    if (eid.source === UID2_SOURCE && isUid2Stale(eid)) {
      staleUid2s.push(eid);
    }
    mergedEids.push(eid);
  });

  const merged: ResolvedCache = {
    ortb2: {
      user: {
        data: newObj?.ortb2?.user?.data || oldObj?.ortb2?.user?.data || [],
        eids: mergedEids,
      },
    },
  };

  return { merged, staleUid2s };
}

export type { CachedEid, ResolvedCache, Uid2RefData };
