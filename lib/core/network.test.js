import { buildRequest } from "./network";
import { default as buildInfo } from "../build.json";

describe("buildRequest", () => {
  it("preserves path query string", () => {
    const dcn = {
      cookies: true,
      host: "host",
      site: "site",
      node: "my-node",
      consent: { reg: "can", gpp: "gpp", gppSectionIDs: [1, 2] },
      sessionID: "123",
    };

    const req = { method: "GET" };
    const request = buildRequest("/path?query=string", dcn, req);

    const url = new URL(request.url);
    expect(url.host).toBe("host");
    expect(url.protocol).toBe("https:");
    expect(url.pathname).toBe("/site/path");
    expect([...url.searchParams.entries()]).toEqual([
      ["query", "string"],
      ["osdk", `web-${buildInfo.version}`],
      ["sid", "123"],
      ["t", dcn.node],
      ["gpp", "gpp"],
      ["gpp_sid", "1,2"],
      ["cookies", "yes"],
    ]);
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
