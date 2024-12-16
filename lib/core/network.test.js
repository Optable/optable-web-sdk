import { buildRequest } from "./network";
import { default as buildInfo } from "../build.json";

describe("buildRequest", () => {
  test("preserves path query string", () => {
    const dcn = {
      cookies: true,
      host: "host",
      site: "site",
      consent: { reg: "can", gpp: "gpp" },
    };

    const req = { method: "GET" };
    const request = buildRequest("/path?query=string", dcn, req);

    expect(request.url).toBe(
      `https://host/site/path?query=string&osdk=web-${buildInfo.version}&reg=can&gpp=gpp&cookies=yes`
    );
  });
});
