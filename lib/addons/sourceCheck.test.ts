import { http, HttpResponse } from "msw";
import { server } from "../test/server";
import { checkSourceExists } from "./sourceCheck";

const CHECK_URL = "https://na.edge.optable.co/config";

beforeEach(() => {
  sessionStorage.clear();
});

describe("checkSourceExists", () => {
  it("returns the site and caches the result when the source exists", async () => {
    let url: URL | undefined;
    server.use(
      http.get(CHECK_URL, ({ request }) => {
        url = new URL(request.url);
        return HttpResponse.json({});
      })
    );

    await expect(checkSourceExists({ site: "pub-site", defaultSite: "pub-sdk", node: "pub" })).resolves.toBe(
      "pub-site"
    );
    expect(url?.searchParams.get("o")).toBe("pub-site");
    expect(url?.searchParams.get("t")).toBe("pub");
    expect(url?.searchParams.get("purpose")).toBe("check-source-exists");
    expect(sessionStorage.getItem("optable_source_exists")).toBe("1");
  });

  it("falls back to defaultSite and caches the miss on a network failure", async () => {
    server.use(http.get(CHECK_URL, () => HttpResponse.error()));

    await expect(checkSourceExists({ site: "unknown-site", defaultSite: "pub-sdk" })).resolves.toBe("pub-sdk");
    expect(sessionStorage.getItem("optable_source_exists")).toBe("0");
  });

  it("falls back to 'default-sdk' when no defaultSite is configured", async () => {
    server.use(http.get(CHECK_URL, () => HttpResponse.error()));

    await expect(checkSourceExists({ site: "unknown-site", defaultSite: "" })).resolves.toBe("default-sdk");
  });

  it("uses the cached miss without probing", async () => {
    sessionStorage.setItem("optable_source_exists", "0");

    await expect(checkSourceExists({ site: "pub-site", defaultSite: "pub-sdk" })).resolves.toBe("pub-sdk");
  });

  it("uses the cached hit without probing", async () => {
    sessionStorage.setItem("optable_source_exists", "1");

    await expect(checkSourceExists({ site: "pub-site", defaultSite: "pub-sdk" })).resolves.toBe("pub-site");
  });

  it("probes a caller-provided host", async () => {
    let hit = false;
    server.use(
      http.get("https://eu.edge.optable.co/config", () => {
        hit = true;
        return HttpResponse.json({});
      })
    );

    await expect(
      checkSourceExists({ site: "pub-site", defaultSite: "pub-sdk", host: "eu.edge.optable.co" })
    ).resolves.toBe("pub-site");
    expect(hit).toBe(true);
  });
});
