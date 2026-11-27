import { http, HttpResponse } from "msw";
import { buildRequest, fetch } from "./network";
import { LocalStorage } from "./storage";
import { DCN_DEFAULTS, getConfig } from "../config";
import { default as buildInfo } from "../build.json";
import { server } from "../test/server";
import { TEST_BASE_URL, TEST_HOST, TEST_SITE } from "../test/mocks";

describe("buildRequest", () => {
  it("preserves path query string", () => {
    const dcn = {
      cookies: true,
      host: "host",
      site: "site",
      node: "my-node",
      consent: { reg: "can", gpp: "gpp", gppSectionIDs: [1, 2] },
      sessionID: "123",
      skipEnrichment: true,
    };

    const req = { method: "GET" };
    const request = buildRequest("/path?query=string", dcn, req);

    const url = new URL(request.url);
    expect(url.host).toBe("host");
    expect(url.protocol).toBe("https:");
    expect(url.pathname).toBe("/path");
    expect([...url.searchParams.entries()]).toEqual([
      ["query", "string"],
      ["osdk", `web-${buildInfo.version}`],
      ["sid", "123"],
      ["skip_enrichment", "true"],
      ["t", dcn.node],
      ["o", dcn.site],
      ["gpp", "gpp"],
      ["gpp_sid", "1,2"],
      ["cookies", "yes"],
    ]);
  });

  it("uses http when insecure is true", () => {
    const dcn = {
      cookies: true,
      host: "host",
      site: "site",
      consent: {},
      sessionID: "123",
      insecure: true,
    };

    const request = buildRequest("/path", dcn, { method: "GET" });
    const url = new URL(request.url);
    expect(url.protocol).toBe("http:");
  });

  it("omits credentials when device access isnt granted", () => {
    const dcn = {
      cookies: true,
      host: "host",
      site: "site",
      consent: { deviceAccess: false },
    };
    let request = buildRequest("/endpoint", dcn, { method: "GET" });
    expect(request.credentials).toBe("omit");

    dcn.consent.deviceAccess = true;

    request = buildRequest("/endpoint", dcn, { method: "GET" });
    expect(request.credentials).toBe("include");
  });
});

describe("fetch", () => {
  const coldConfig = (overrides) =>
    getConfig({ host: TEST_HOST, site: TEST_SITE, cookies: false, initPassport: false, ...overrides });

  // Mints a visitor for every request that arrives without a passport, as the edge does.
  function mintingEdge() {
    const sent = [];
    server.use(
      http.all(`${TEST_BASE_URL}/*`, ({ request }) => {
        const passport = new URL(request.url).searchParams.get("passport");
        sent.push(passport);
        const minted = sent.filter((p) => p === "").length;
        return HttpResponse.json({ passport: passport || `visitor-${minted}` });
      })
    );
    return sent;
  }

  beforeEach(() => localStorage.clear());
  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it("mints one visitor for calls fired together on a cold cache", async () => {
    const config = coldConfig();
    const sent = mintingEdge();

    await Promise.all([
      fetch("/v2/targeting", config),
      fetch("/identify", config, { method: "POST" }),
      fetch("/v2/tokenize", config, { method: "POST" }),
    ]);

    expect(sent).toEqual(["", "visitor-1", "visitor-1"]);
    expect(new LocalStorage(config).getPassport()).toBe("visitor-1");
  });

  it("hands the mint to the next call when the first one fails", async () => {
    const config = coldConfig();
    const sent = mintingEdge();
    server.use(
      http.get(`${TEST_BASE_URL}/v2/targeting`, () => HttpResponse.json({ error: "boom" }, { status: 500 }), {
        once: true,
      })
    );

    const [targeting, ...followers] = await Promise.allSettled([
      fetch("/v2/targeting", config),
      fetch("/identify", config, { method: "POST" }),
      fetch("/v2/tokenize", config, { method: "POST" }),
    ]);

    expect(targeting.status).toBe("rejected");
    expect(followers.map((f) => f.status)).toEqual(["fulfilled", "fulfilled"]);
    expect(sent).toEqual(["", "visitor-1"]);
  });

  it("stops waiting on a first call that never answers", async () => {
    jest.useFakeTimers();
    const config = coldConfig({ node: "hung" });
    const paths = [];
    jest.spyOn(globalThis, "fetch").mockImplementation((request) => {
      paths.push(new URL(request.url).pathname);
      return paths.length === 1
        ? new Promise(() => {})
        : Promise.resolve(
            new Response(JSON.stringify({ passport: "visitor" }), { headers: { "Content-Type": "application/json" } })
          );
    });

    fetch("/v2/targeting", config);
    const follower = fetch("/identify", config, { method: "POST" });

    await jest.advanceTimersByTimeAsync(1999);
    expect(paths).toEqual(["/v2/targeting"]);

    await jest.advanceTimersByTimeAsync(1);
    await follower;
    expect(paths).toEqual(["/v2/targeting", "/identify"]);
  });

  it.each([
    ["in cookie mode", { cookies: true }],
    ["without device access", { consent: { static: { ...DCN_DEFAULTS.consent, deviceAccess: false } } }],
  ])("sends calls together %s", async (_, overrides) => {
    const config = coldConfig(overrides);
    const fetchSpy = jest.spyOn(globalThis, "fetch");

    const calls = [fetch("/v2/targeting", config), fetch("/identify", config, { method: "POST" })];

    expect(fetchSpy).toHaveBeenCalledTimes(2);
    await Promise.all(calls);
  });

  it("sends calls together once the edge has answered without a passport", async () => {
    const config = coldConfig({ node: "no-echo" });
    server.use(http.all(`${TEST_BASE_URL}/*`, () => HttpResponse.json({})));
    const fetchSpy = jest.spyOn(globalThis, "fetch");
    const burst = () => [fetch("/v2/targeting", config), fetch("/identify", config, { method: "POST" })];

    await Promise.all(burst());
    fetchSpy.mockClear();
    const calls = burst();

    expect(fetchSpy).toHaveBeenCalledTimes(2);
    await Promise.all(calls);
  });
});
