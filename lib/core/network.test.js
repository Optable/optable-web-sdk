import { http, HttpResponse } from "msw";
import { buildRequest, fetch } from "./network";
import { LocalStorage } from "./storage";
import { getConfig } from "../config";
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
});
