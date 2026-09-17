// Pushes the optableSignalEnrichment reporting key-value to Google Ad
// Manager, for measuring Optable's impact. Value format:
// "<treatment|control>,<enriched|empty>,<context|nocontext>". Uses
// googletag.setConfig, which merges rather than overwriting other targeting.

type SignalEnrichmentState = {
  // Split-test group of this user.
  control: boolean;
  // Whether the EID cache holds identifiers.
  enriched: boolean;
  // Whether contextual segments were fetched.
  context?: boolean;
};

export function setGAMSignalEnrichment(state: SignalEnrichmentState): void {
  const value = [
    state.control ? "control" : "treatment",
    state.enriched ? "enriched" : "empty",
    state.context ? "context" : "nocontext",
  ].join(",");

  window.googletag = window.googletag || { cmd: [] };
  window.googletag.cmd.push(() => {
    // Fail silently: a reporting key-value must never break the host page,
    // e.g. on a GPT version without setConfig.
    try {
      // The installed @types/googletag predates setConfig's targeting key.
      const config = { targeting: { optableSignalEnrichment: value } };
      window.googletag.setConfig(config as Parameters<typeof window.googletag.setConfig>[0]);
    } catch {
      // ignore
    }
  });
}

export type { SignalEnrichmentState };
