import type { ResolvedConfig } from "../config";
import { fetch } from "../core/network";

type ResolveTrait = {
  key: string;
  value: string;
};

type ResolveCluster = {
  ids: string[];
  traits: ResolveTrait[];
};

type ResolveResponse = {
  clusters: ResolveCluster[];
  lmpid?: string;
};

async function Resolve(config: ResolvedConfig, id?: string): Promise<ResolveResponse> {
  const searchParams = new URLSearchParams();
  if (typeof id === "string") {
    searchParams.append("id", id);
  }
  const path = "/v1/resolve?" + searchParams.toString();

  const response = await fetch<unknown>(path, config, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  return parseResolveResponse(response);
}

function parseResolveResponse(resolveResponse: unknown): ResolveResponse {
  const response: ResolveResponse = { clusters: [], lmpid: "" };

  if (typeof resolveResponse !== "object" || resolveResponse === null) {
    return response;
  }

  if ("lmpid" in resolveResponse && typeof resolveResponse?.lmpid === "string") {
    response.lmpid = resolveResponse.lmpid;
  }

  if (!("clusters" in resolveResponse) || !Array.isArray(resolveResponse?.clusters)) {
    return response;
  }

  for (const c of resolveResponse.clusters) {
    const cluster: ResolveCluster = { ids: [], traits: [] };

    if (Array.isArray(c?.ids)) {
      for (const id of c.ids) {
        if (typeof id === "string") {
          cluster.ids.push(id);
        }
      }
    }

    if (Array.isArray(c?.traits)) {
      for (const trait of c.traits) {
        if (typeof trait?.key === "string" && typeof trait?.value === "string") {
          cluster.traits.push({ key: trait.key, value: trait.value });
        }
      }
    }

    if (cluster.ids.length > 0 || cluster.traits.length > 0) {
      response.clusters.push(cluster);
    }
  }

  return response;
}

export { Resolve, ResolveResponse, parseResolveResponse };
