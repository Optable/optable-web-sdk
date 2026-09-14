// Converts cached EIDs into GPT secure-signal pairs for
// installGPTSecureSignals, optionally filtered by source, inserter or
// matcher. An empty or missing filter list means no constraint on that field.

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

  const signals: SecureSignal[] = [];
  eids.forEach((eid) => {
    if (!allows(filter.sources, eid.source)) return;
    if (!allows(filter.inserters, eid.inserter)) return;
    if (!allows(filter.matchers, eid.matcher)) return;

    eid.uids?.forEach((uid) => {
      if (uid.id) {
        signals.push({ provider: eid.source, id: uid.id });
      }
    });
  });
  return signals;
}

export type { SecureSignalEid, SecureSignalsFilter, SecureSignal };
