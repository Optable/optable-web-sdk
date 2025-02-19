import { buildRequest } from "./network";
import { default as buildInfo } from "../build.json";

describe("buildRequest", () => {
  it("preserves path query string", () => {
    const dcn = {
      cookies: true,
      host: "host",
      site: "site",
      consent: { reg: "can", gpp: "gpp", gppSectionIDs: [1, 2] },
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
      ["gpp", "gpp"],
      ["gpp_sid", "1,2"],
      ["cookies", "yes"],
    ]);
  });
});
