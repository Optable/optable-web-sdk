// Converts cached EIDs into GPT secure-signal pairs for
// installGPTSecureSignals, optionally filtered by source, inserter or
// matcher. An empty or missing filter list means no constraint on that field.
//
// One signal per source: GPT keys secure signals by provider, so registering
// a provider twice drops all but one id. The first EID and first non-empty
// uid win.

type SecureSignalEid = {
  source: string;
  inserter?: string;
  matcher?: string;
  uids?: Array<{ id?: string }>;
};

type SecureSignalsFilter = {
  sources?: string[];
  inserters?: string[];
  matchers?: string[];
};

type SecureSignal = { provider: string; id: string };

export function secureSignalsFromEids(eids: SecureSignalEid[], filter: SecureSignalsFilter = {}): SecureSignal[] {
  const allows = (list: string[] | undefined, value: string | undefined) => !list?.length || list.includes(value ?? "");

  const bySource = new Map<string, SecureSignal>();
  eids.forEach((eid) => {
    if (bySource.has(eid.source)) return;
    if (!allows(filter.sources, eid.source)) return;
    if (!allows(filter.inserters, eid.inserter)) return;
    if (!allows(filter.matchers, eid.matcher)) return;

    const uid = eid.uids?.find((u) => u.id);
    if (uid?.id) {
      bySource.set(eid.source, { provider: eid.source, id: uid.id });
    }
  });
  return [...bySource.values()];
}

export type { SecureSignalEid, SecureSignalsFilter, SecureSignal };
