import { http, HttpResponse } from "msw";
import { server } from "../test/server";
import { checkSourceExists } from "./sourceCheck";

const CHECK_URL = "https://us.edge.optable.co/config";

const keyFor = (site: string, node = "", host = "us.edge.optable.co") =>
  `optable_source_exists:${host}:${node}:${site}`;

beforeEach(() => {
  sessionStorage.clear();
});

afterEach(() => {
  jest.useRealTimers();
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
    expect(sessionStorage.getItem(keyFor("pub-site", "pub"))).toBe("1");
  });

  it("falls back to defaultSite and caches the miss on a network failure", async () => {
    server.use(http.get(CHECK_URL, () => HttpResponse.error()));

    await expect(checkSourceExists({ site: "unknown-site", defaultSite: "pub-sdk" })).resolves.toBe("pub-sdk");
    expect(sessionStorage.getItem(keyFor("unknown-site"))).toBe("0");
  });

  it("falls back to 'default' when no defaultSite is configured", async () => {
    server.use(http.get(CHECK_URL, () => HttpResponse.error()));

    await expect(checkSourceExists({ site: "unknown-site", defaultSite: "" })).resolves.toBe("default");
  });

  it("uses the cached miss without probing", async () => {
    sessionStorage.setItem(keyFor("pub-site"), "0");

    await expect(checkSourceExists({ site: "pub-site", defaultSite: "pub-sdk" })).resolves.toBe("pub-sdk");
  });

  it("uses the cached hit without probing", async () => {
    sessionStorage.setItem(keyFor("pub-site"), "1");

    await expect(checkSourceExists({ site: "pub-site", defaultSite: "pub-sdk" })).resolves.toBe("pub-site");
  });

  it("does not apply a cached verdict to another site, node or host", async () => {
    sessionStorage.setItem(keyFor("pub-site"), "0");
    let probes = 0;
    server.use(
      http.get(CHECK_URL, () => {
        probes++;
        return HttpResponse.json({});
      }),
      http.get("https://eu.edge.optable.co/config", () => {
        probes++;
        return HttpResponse.json({});
      })
    );

    // Same site on a different node, then on a different host, then a different
    // site entirely — none of them may reuse the cached miss.
    await expect(checkSourceExists({ site: "pub-site", defaultSite: "pub-sdk", node: "pub" })).resolves.toBe(
      "pub-site"
    );
    await expect(
      checkSourceExists({ site: "pub-site", defaultSite: "pub-sdk", host: "eu.edge.optable.co" })
    ).resolves.toBe("pub-site");
    await expect(checkSourceExists({ site: "other-site", defaultSite: "pub-sdk" })).resolves.toBe("other-site");

    expect(probes).toBe(3);
    expect(sessionStorage.getItem(keyFor("pub-site"))).toBe("0");
  });

  it("falls back without caching a miss when the probe times out", async () => {
    jest.useFakeTimers();
    server.use(http.get(CHECK_URL, () => new Promise<never>(() => {})));

    const pending = checkSourceExists({ site: "slow-site", defaultSite: "pub-sdk" });
    await jest.advanceTimersByTimeAsync(1500);

    await expect(pending).resolves.toBe("pub-sdk");
    expect(sessionStorage.getItem(keyFor("slow-site"))).toBeNull();
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
    expect(sessionStorage.getItem(keyFor("pub-site", "", "eu.edge.optable.co"))).toBe("1");
  });
});
