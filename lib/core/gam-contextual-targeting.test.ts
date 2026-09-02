import { http, HttpResponse } from "msw";
import { setContextualTargetingInGAM } from "./gam-contextual-targeting";
import OptableSDK from "../sdk";
import { TEST_BASE_URL, TEST_HOST, TEST_SITE } from "../test/mocks";
import { server } from "../test/server";

type Category = { taxonomy: string; id: string };
type Keyword = { keyword: string; prominence: number };

function respondWithClassifications(categories: Category[], keywords: Keyword[] = []) {
  const calls: string[] = [];
  server.use(
    http.post(`${TEST_BASE_URL}/v1beta1/contextual`, async ({ request }) => {
      calls.push(((await request.json()) as { url?: string })?.url ?? "");
      return HttpResponse.json({ classifications: { categories, keywords } }, { status: 200 });
    })
  );
  return calls;
}

describe("setContextualTargetingInGAM", () => {
  let SDK: OptableSDK;
  const w = window as unknown as { googletag?: any };

  beforeEach(() => {
    SDK = new OptableSDK({ host: TEST_HOST, site: TEST_SITE });
    w.googletag = { cmd: [], pubads: jest.fn() };
  });

  it("pushes contextual key-values to GAM", async () => {
    respondWithClassifications([
      { taxonomy: "ctx_iab", id: "IAB1" },
      { taxonomy: "ctx_iab", id: "IAB2" },
    ]);
    const setTargeting = jest.fn();
    w.googletag.pubads.mockReturnValue({ setTargeting });

    await setContextualTargetingInGAM(SDK);
    w.googletag.cmd.forEach((cmd: () => void) => cmd());

    expect(setTargeting).toHaveBeenCalledWith("ctx_iab", ["IAB1", "IAB2"]);
  });

  it("forwards taxonomyKeys to the key-value conversion", async () => {
    respondWithClassifications([
      { taxonomy: "ctx_iab", id: "IAB1" },
      { taxonomy: "ctx_other", id: "X1" },
    ]);
    const setTargeting = jest.fn();
    w.googletag.pubads.mockReturnValue({ setTargeting });

    await setContextualTargetingInGAM(SDK, { ctx_iab: "my_key" });
    w.googletag.cmd.forEach((cmd: () => void) => cmd());

    expect(setTargeting).toHaveBeenCalledTimes(1);
    expect(setTargeting).toHaveBeenCalledWith("my_key", ["IAB1"]);
  });

  it("queues nothing when there are no key-values", async () => {
    respondWithClassifications([]);

    await setContextualTargetingInGAM(SDK);

    expect(w.googletag.cmd).toHaveLength(0);
  });

  it("creates the googletag stub when the page has none", async () => {
    respondWithClassifications([{ taxonomy: "ctx_iab", id: "IAB1" }]);
    delete w.googletag;

    await setContextualTargetingInGAM(SDK);

    expect(w.googletag!.cmd).toHaveLength(1);
  });

  it("forwards options to the key-value conversion", async () => {
    respondWithClassifications([], [{ keyword: "programmatic", prominence: 1 }]);
    const setTargeting = jest.fn();
    w.googletag.pubads.mockReturnValue({ setTargeting });

    await setContextualTargetingInGAM(SDK, undefined, { keywordKey: "ctx_custom" });
    w.googletag.cmd.forEach((cmd: () => void) => cmd());

    expect(setTargeting).toHaveBeenCalledTimes(1);
    expect(setTargeting).toHaveBeenCalledWith("ctx_custom", ["programmatic"]);
  });

  it("forwards a url override to the segments fetch", async () => {
    const calls = respondWithClassifications([{ taxonomy: "ctx_iab", id: "IAB1" }]);

    await setContextualTargetingInGAM(SDK, undefined, undefined, "https://example.com/route");

    expect(calls).toEqual(["https://example.com/route"]);
  });

  it("reuses a classification already fetched for the same URL", async () => {
    const calls = respondWithClassifications([{ taxonomy: "ctx_iab", id: "IAB1" }]);
    const setTargeting = jest.fn();
    w.googletag.pubads.mockReturnValue({ setTargeting });

    await SDK.ctxSegments();
    await setContextualTargetingInGAM(SDK);
    w.googletag.cmd.forEach((cmd: () => void) => cmd());

    expect(calls).toHaveLength(1);
    expect(setTargeting).toHaveBeenCalledWith("ctx_iab", ["IAB1"]);
  });
});
