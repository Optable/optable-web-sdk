import { setGAMSignalEnrichment } from "./gam-signal-enrichment";

const w = window as unknown as { googletag?: any };

function drain() {
  w.googletag.cmd.forEach((cmd: () => void) => cmd());
}

describe("setGAMSignalEnrichment", () => {
  beforeEach(() => {
    w.googletag = { cmd: [], setConfig: jest.fn() };
  });

  it.each([
    [{ control: false, enriched: true, context: true }, "treatment,enriched,context"],
    [{ control: true, enriched: false }, "control,empty,nocontext"],
    [{ control: false, enriched: false, context: false }, "treatment,empty,nocontext"],
  ])("pushes the reporting key-value for %j", (state, expected) => {
    setGAMSignalEnrichment(state);
    drain();

    expect(w.googletag.setConfig).toHaveBeenCalledWith({ targeting: { optableSignalEnrichment: expected } });
  });

  it("creates the googletag stub when the page has none", () => {
    delete w.googletag;
    setGAMSignalEnrichment({ control: false, enriched: true });
    expect(w.googletag!.cmd).toHaveLength(1);
  });
});
