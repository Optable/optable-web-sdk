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

  const NO_PASSPORT_PATHS = ["/v1beta1/contextual", "/v1/resolve"];

  // Mints a visitor for every request that arrives without a passport, as the
  // edge does, and like it answers contextual and resolve without one.
  function mintingEdge() {
    const sent = [];
    server.use(
      http.all(`${TEST_BASE_URL}/*`, ({ request }) => {
        const url = new URL(request.url);
        if (NO_PASSPORT_PATHS.includes(url.pathname)) {
          return HttpResponse.json({});
        }
        const passport = url.searchParams.get("passport");
        sent.push(passport);
        const minted = sent.filter((p) => p === "").length;
        return HttpResponse.json({ passport: passport || `visitor-${minted}` });
      })
    );
    return sent;
  }

  // The same edge as a fetch stub for fake timers. Each path answers after its
  // delay, or never without one. Returns the visitor each request was served as.
  function timedEdge(delays) {
    const served = [];
    let minted = 0;
    jest.spyOn(globalThis, "fetch").mockImplementation((request) => {
      const url = new URL(request.url);
      const passport = url.searchParams.get("passport") || `visitor-${++minted}`;
      served.push(`${url.pathname} ${passport}`);
      const delay = delays[url.pathname];
      return new Promise((resolve) => {
        if (delay === undefined) {
          return;
        }
        const response = new Response(JSON.stringify({ passport }), {
          headers: { "Content-Type": "application/json" },
        });
        setTimeout(() => resolve(response), delay);
      });
    });
    return served;
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

  it.each(NO_PASSPORT_PATHS)("does not let %s lead the mint", async (path) => {
    const config = coldConfig();
    const sent = mintingEdge();
    const fetchSpy = jest.spyOn(globalThis, "fetch");

    const calls = [
      fetch(path, config),
      fetch("/v2/targeting", config),
      fetch("/identify", config, { method: "POST" }),
      fetch("/v2/tokenize", config, { method: "POST" }),
    ];

    expect(fetchSpy).toHaveBeenCalledTimes(2);
    await Promise.all(calls);
    expect(sent).toEqual(["", "visitor-1", "visitor-1"]);
  });

  it("hands the mint to the next call when the first one never answers", async () => {
    jest.useFakeTimers();
    const config = coldConfig({ node: "hung" });
    const served = timedEdge({ "/identify": 100, "/v2/tokenize": 100 });

    fetch("/v2/targeting", config);
    const followers = [
      fetch("/identify", config, { method: "POST" }),
      fetch("/v2/tokenize", config, { method: "POST" }),
    ];

    await jest.advanceTimersByTimeAsync(1999);
    expect(served).toEqual(["/v2/targeting visitor-1"]);

    await jest.advanceTimersByTimeAsync(201);
    await Promise.all(followers);
    expect(served).toEqual(["/v2/targeting visitor-1", "/identify visitor-2", "/v2/tokenize visitor-2"]);
  });

  it("does not hold a later call behind a mint that never answers", async () => {
    jest.useFakeTimers();
    const config = coldConfig({ node: "dead" });
    const served = timedEdge({});

    fetch("/v2/targeting", config);
    await jest.advanceTimersByTimeAsync(10000);
    fetch("/identify", config, { method: "POST" });

    expect(served).toEqual(["/v2/targeting visitor-1", "/identify visitor-2"]);
  });

  it.each([
    ["before", 2050],
    ["after", 2500],
  ])("stores the passport of the call that took over when the first one answers %s it", async (_, delay) => {
    jest.useFakeTimers();
    const config = coldConfig({ node: `slow-${delay}` });
    const served = timedEdge({ "/v2/targeting": delay, "/identify": 100, "/v2/tokenize": 100 });

    const calls = [
      fetch("/v2/targeting", config),
      fetch("/identify", config, { method: "POST" }),
      fetch("/v2/tokenize", config, { method: "POST" }),
    ];
    await jest.advanceTimersByTimeAsync(2500);
    await Promise.all(calls);

    expect(served).toEqual(["/v2/targeting visitor-1", "/identify visitor-2", "/v2/tokenize visitor-2"]);
    expect(new LocalStorage(config).getPassport()).toBe("visitor-2");
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
