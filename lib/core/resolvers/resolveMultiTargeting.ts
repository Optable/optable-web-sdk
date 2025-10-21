import type { EID } from "iab-openrtb/v26";
import type { IDMatchMethod } from "iab-adcom";
import { TargetingResponse } from "../../edge/targeting";
import { isObject } from "../utils";

type MultiNodeTargetingResponse = TargetingResponse & { eidSources: Set<string>; resolvedIds: Set<string> };
type Ortb2 = TargetingResponse["ortb2"];

type NodeTargetingRule = {
  // Targeting function to resolve. e.g. window.optable.node_sdk_instance.targeting('__ip__')
  targetingFn: () => Promise<TargetingResponse>;
  // Technology provider domain
  matcher?: string;
  // Match method (mm) based on IAB v26 standards.
  // Determines how the ID was matched. Possible values:
  // 0 = unknown, 1 = no_match, 2 = cookie_sync, 3 = authenticated, 4 = observed, 5 = inference.
  mm?: IDMatchMethod;
  // (Optional) If provided we will only pick one resolved Ortb2Response from the most prioritize matcher.
  // Any values below 1 will be threated as ignore
  priority?: number;
};

// Resolve multiple targeting nodes
// If any of the targeting nodes have the 'priority' attribute, we will resolve the most prioritize node
// Otherwise, we will aggregate all resolved targeting data
// If multiple nodes have the same priority, we will append the eids
// Returns the resolved Ortb2Response and the list of eid sources that were resolved
async function resolveMultiNodeTargeting(rules: NodeTargetingRule[]): Promise<MultiNodeTargetingResponse> {
  if (!rules) {
    return Promise.reject("No targeting rules provided");
  }

  return rules.some((x) => x.priority) ? resolvePriorityTargeting(rules) : resolveAggregateTargeting(rules);
}

// Aggregate all resolved targeting data
async function resolveAggregateTargeting(rules: NodeTargetingRule[]): Promise<MultiNodeTargetingResponse> {
  const eidSources = new Set<string>();
  const resolvedIds = new Set<string>();
  const { refs, process: refsProcessor } = buildRefsProcessor();
  const ortb2: Ortb2 = {
    user: {
      data: [],
      eids: [],
    },
  };

  function processTokens(response: TargetingResponse, matcher?: string, mm?: IDMatchMethod) {
    const { resolved_ids = [] } = response;
    const { data = [], eids = [] } = response.ortb2?.user ?? {};
    ortb2.user!.data!.push(...data);

    for (const id of resolved_ids) {
      resolvedIds.add(id);
    }

    eids
      .filter((x) => x.uids.length)
      .forEach((eid) => {
        const match = eid.matcher ?? matcher;
        match && eidSources.add(match);

        ortb2.user!.eids!.push({
          ...refsProcessor(response, eid),
          mm: eid.mm ?? mm,
          matcher: eid.matcher ?? matcher,
        });
      });
  }

  const targetingFnPromises = rules.map(({ targetingFn, matcher, mm }) =>
    targetingFn().then((res: TargetingResponse) => processTokens(res, matcher, mm))
  );

  await Promise.allSettled(targetingFnPromises);

  return { ortb2, eidSources, refs, resolvedIds };
}

// Resolve the most prioritize targeting node
// If multiple nodes have the same priority, we will append the eids
async function resolvePriorityTargeting(rules: NodeTargetingRule[]): Promise<MultiNodeTargetingResponse> {
  const eidSources = new Set<string>();
  const resolvedIds = new Set<string>();
  const { refs, process: refsProcessor } = buildRefsProcessor();
  const ortb2: Ortb2 = {
    user: {
      data: [],
      eids: [],
    },
  };

  const sourcesByPriority = new Map<number, string[]>();
  const eidsByPriority = new Map<number, EID[]>();
  const resolvedIdsByPriority = new Map<number, string[]>();

  function processTokens(response: TargetingResponse, matcher?: string, mm?: IDMatchMethod, priority: number = 0) {
    const adjustedPriority = Math.max(0, priority);
    const { data = [], eids = [] } = response.ortb2?.user ?? {};

    ortb2.user!.data!.push(...data);
    resolvedIdsByPriority.set(adjustedPriority, response.resolved_ids ?? []);

    eids
      .filter((x) => x.uids.length)
      .forEach((eid) => {
        const match = eid.matcher ?? matcher;
        const currentSources = sourcesByPriority.get(adjustedPriority) ?? [];
        match && sourcesByPriority.set(adjustedPriority, [...currentSources, match]);

        const newEid = {
          ...refsProcessor(response, eid),
          matcher: eid.matcher ?? matcher,
          mm: eid.mm ?? mm,
        };

        const currentEids = eidsByPriority.get(adjustedPriority) ?? [];
        eidsByPriority.set(adjustedPriority, [...currentEids, newEid]);
      });
  }

  const targetingFnPromises = rules.map(({ targetingFn, matcher, mm, priority }) =>
    targetingFn().then((res: TargetingResponse) => processTokens(res, matcher, mm, priority))
  );

  await Promise.allSettled(targetingFnPromises);

  const priority = Array.from(eidsByPriority.keys())
    .sort((a, b) => a - b)
    .filter((x) => eidsByPriority.get(x)?.length)
    .shift();

  if (priority) {
    const sources = sourcesByPriority.get(priority) || [];
    const resolvedIdsArray = resolvedIdsByPriority.get(priority) || [];
    ortb2.user!.eids!.push(...(eidsByPriority.get(priority) || []));
    sources.forEach((source) => eidSources.add(source));
    resolvedIdsArray.forEach((id) => resolvedIds.add(id));
  }

  return {
    ortb2,
    eidSources,
    refs,
    resolvedIds,
  };
}

type EIDProcessor = (response: TargetingResponse, eid: EID) => EID;

function buildRefsProcessor(): { refs: Record<string, unknown>; process: EIDProcessor } {
  const refs: Record<string, unknown> = {};
  let globalRef = 0;

  return {
    refs,
    process: (response: TargetingResponse, eid: EID): EID => {
      if (!response.refs) {
        return eid;
      }

      for (const uid of eid.uids) {
        if (!isObject(uid.ext?.optable)) {
          continue;
        }

        if ("ref" in uid.ext.optable && typeof uid.ext.optable.ref === "string") {
          const refBody = response.refs[uid.ext.optable.ref];
          // Assign new global ref key
          globalRef += 1;
          const newRefKey = globalRef.toString(10);
          // Mutate global refs
          refs[newRefKey] = refBody;
          uid.ext.optable.ref = newRefKey;
        }
      }

      return eid;
    },
  };
}

export { resolveMultiNodeTargeting };
export type { MultiNodeTargetingResponse, TargetingResponse, NodeTargetingRule };
