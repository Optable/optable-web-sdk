// Merges a fresh targeting or tokenize response into a wrapper's rolling EID
// cache. Merge rules are documented in eid-cache.md; inputs are never mutated.
//
// UID2 refresh material lives in the cache's refs sidecar, keyed by EID
// source — never on the EIDs themselves. Cached EIDs are wire EIDs: every
// consumer can hand them to bidding as-is, with nothing to strip.

// UID2 refresh material: the refresh response body, referenced from the
// targeting response refs map and carried in the cache's refs sidecar.
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
};

type ResolvedCache = {
  ortb2?: { user?: { data?: unknown[]; eids?: CachedEid[] } };
  // Refresh material sidecar. On a wire targeting response the map is keyed
  // by opaque ref keys; in the merged cache it is keyed by EID source.
  refs?: Record<string, unknown>;
};

type StaleUid2 = { source: string; ref: Uid2RefData };

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

// Builds the cache's source-keyed refs sidecar from a response's EIDs and its
// opaque-keyed refs map.
//
// One entry per source, where the opaque keying could hold several: the last
// EID for a source wins, matching which one mergeCache keeps.
export function resolveRefs(eids: CachedEid[], refs?: Record<string, unknown>): Record<string, Uid2RefData> {
  const bySource: Record<string, Uid2RefData> = {};
  eids.forEach((eid) => {
    const ref = refFor(eid, refs);
    if (ref) {
      bySource[eid.source] = ref;
    } else {
      delete bySource[eid.source];
    }
  });
  return bySource;
}

// The source's ref data when the cache holds one usable for a refresh, else null.
export function getRefData(cache: ResolvedCache | null | undefined, source: string): Uid2RefData | null {
  const ref = cache?.refs?.[source];
  return isUid2RefData(ref) && ref.refresh_token && ref.refresh_response_key ? ref : null;
}

// UID2 tokens carry a refresh_from timestamp; past it they need refreshing.
export function isUid2Stale(cache: ResolvedCache | null | undefined, source: string = UID2_SOURCE): boolean {
  const ref = getRefData(cache, source);
  if (!ref) return false;
  return Date.now() > (ref.refresh_from || 0);
}

// Normalizes a wire response into the cache format: source-keyed refs,
// ref pointers stripped, every other field kept. Never mutates its input.
//
// Idempotent, so it is safe on anything: a value with no pointers left is
// already in cache format and its refs pass through, rather than being
// resolved against pointers that are no longer there.
export function replaceCache<T extends ResolvedCache>(response: T): T {
  const user = response.ortb2?.user;
  const eids = user?.eids ?? [];
  const wireShaped = eids.some((eid) => eid.uids?.[0]?.ext?.optable?.ref !== undefined);
  const copy = { ...response, refs: wireShaped ? resolveRefs(eids, response.refs) : { ...response.refs } };
  if (user?.eids) {
    copy.ortb2 = {
      ...response.ortb2,
      user: { ...user, eids: eids.map((eid) => ({ ...eid, uids: (eid.uids ?? []).map(stripRefPointer) })) },
    };
  }
  return copy;
}

/**
 * Merges a fresh response into the cached one. Both arguments are in cache
 * format — source-keyed refs, no ext.optable.ref pointers — and so is the
 * result. The cache read back from storage already is, since setTargeting
 * writes through replaceCache; a wire response goes through replaceCache
 * first.
 */
export function mergeCache(
  newObj: ResolvedCache | null | undefined,
  oldObj: ResolvedCache | null | undefined,
  options?: { maxUidsPerEid?: number }
): { merged: ResolvedCache; staleUid2s: StaleUid2[] } {
  const oldEids = oldObj?.ortb2?.user?.eids || [];
  const newEids = newObj?.ortb2?.user?.eids || [];
  const maxUids = options?.maxUidsPerEid ?? DEFAULT_MAX_UIDS_PER_EID;

  // Copies are wire-clean: capped uids, and the ref pointer into the response
  // refs map is dropped since the sidecar replaces it.
  const copyOf = (eid: CachedEid): CachedEid => ({
    ...eid,
    uids: (eid.uids || []).slice(0, maxUids).map(stripRefPointer),
  });

  const newSources = new Set(newEids.map((e) => e.source));
  const eidMap = new Map<string, CachedEid>();
  const refs: Record<string, Uid2RefData> = {};

  // Carry over old EIDs whose source is not in the new response, along with
  // their refs entry.
  oldEids.forEach((eid) => {
    if (!eid.uids?.length) return;
    if (!newSources.has(eid.source)) {
      eidMap.set(eid.source, copyOf(eid));
      const ref = getRefData(oldObj, eid.source);
      if (ref) {
        refs[eid.source] = ref;
      }
    }
  });

  // New EIDs overwrite old ones with the same source, and so does their refs
  // entry: a source re-resolved without one has its stale entry dropped.
  newEids.forEach((eid) => {
    if (!eid.uids?.length) return;
    eidMap.set(eid.source, copyOf(eid));
    const ref = getRefData(newObj, eid.source);
    if (ref) {
      refs[eid.source] = ref;
    } else {
      delete refs[eid.source];
    }
  });

  const mergedEids: CachedEid[] = [];
  const staleUid2s: StaleUid2[] = [];
  eidMap.forEach((eid) => {
    mergedEids.push(eid);
  });

  const merged: ResolvedCache = {
    ortb2: {
      user: {
        data: newObj?.ortb2?.user?.data || oldObj?.ortb2?.user?.data || [],
        eids: mergedEids,
      },
    },
    refs,
  };

  eidMap.forEach((eid) => {
    if (eid.source === UID2_SOURCE && isUid2Stale(merged, eid.source)) {
      staleUid2s.push({ source: eid.source, ref: refs[eid.source] });
    }
  });

  return { merged, staleUid2s };
}

type CachedUid = NonNullable<CachedEid["uids"]>[number];

function stripRefPointer(uid: CachedUid): CachedUid {
  const optable = uid.ext?.optable;
  if (!optable || optable.ref === undefined) return uid;

  const { ref: _dropped, ...restOptable } = optable;
  const copy: CachedUid = { ...uid };
  if (Object.keys(restOptable).length) {
    copy.ext = { ...uid.ext, optable: restOptable };
  } else {
    const { optable: _optable, ...restExt } = uid.ext!;
    if (Object.keys(restExt).length) {
      copy.ext = restExt;
    } else {
      delete copy.ext;
    }
  }
  return copy;
}

export type { CachedEid, ResolvedCache, StaleUid2, Uid2RefData };
