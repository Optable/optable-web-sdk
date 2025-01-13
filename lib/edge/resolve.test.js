import { getConfig } from "../config";
import { TEST_HOST, TEST_SITE, TEST_BASE_URL } from "../test/mocks";
import { parseResolveResponse, Resolve } from "./resolve";
import { TEST_BASE_URL, TEST_HOST, TEST_SITE } from "../test/mocks";

describe("resolve", () => {
  test("forwards identifier when present", () => {
    const config = getConfig({ host: TEST_HOST, site: TEST_SITE });
    const fetchSpy = jest.spyOn(window, "fetch");

    Resolve(config, "id");
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        url: `${TEST_BASE_URL}/v1/resolve?id=id&osdk=web-0.0.0-experimental&cookies=yes`,
      })
    );

    Resolve(config);
    expect.objectContaining({
      method: "GET",
      url: `${TEST_BASE_URL}/v1/resolve?osdk=web-0.0.0-experimental&cookies=yes`,
    });
  });
});

describe("parseResolveResponse", () => {
  test("parses expected responses", () => {
    const empty = { clusters: [], lmpid: "" };

    const cases = [
      // Unexpected response types return empty response
      { input: {}, output: empty },
      { input: null, output: empty },
      { input: undefined, output: empty },
      { input: 1, output: empty },
      { input: true, output: empty },
      { input: [], output: empty },

      { input: { clusters: [null] }, output: empty },
      { input: { clusters: [undefined] }, output: empty },
      { input: { clusters: [1] }, output: empty },
      { input: { clusters: [true] }, output: empty },
      { input: { clusters: [[]] }, output: empty },

      { input: { clusters: [{ ids: {}, traits: {} }] }, output: empty },
      { input: { clusters: [{ ids: null, traits: null }] }, output: empty },
      { input: { clusters: [{ ids: undefined, traits: undefined }] }, output: empty },
      { input: { clusters: [{ ids: 1, traits: 1 }] }, output: empty },
      { input: { clusters: [{ ids: true, traits: true }] }, output: empty },
      { input: { clusters: [{ ids: [], traits: [] }] }, output: empty },

      { input: { clusters: [{ ids: [null], traits: [null] }] }, output: empty },
      { input: { clusters: [{ ids: [undefined], traits: [undefined] }] }, output: empty },
      { input: { clusters: [{ ids: [1], traits: [1] }] }, output: empty },
      { input: { clusters: [{ ids: [true], traits: [true] }] }, output: empty },

      // Additional properties are skipped
      {
        input: {
          clusters: [
            { ids: ["i4:<ip>", "e:<sha256>"], traits: [{ key: "<key>", value: "<value>" }], additional: "property" },
          ],
        },
        output: {
          clusters: [{ ids: ["i4:<ip>", "e:<sha256>"], traits: [{ key: "<key>", value: "<value>" }] }],
          lmpid: "",
        },
      },
      {
        input: { clusters: [{ ids: ["i4:<ip>", "e:<sha256>"], traits: [{ key: "<key>", value: "<value>" }] }] },
        output: {
          clusters: [{ ids: ["i4:<ip>", "e:<sha256>"], traits: [{ key: "<key>", value: "<value>" }] }],
          lmpid: "",
        },
      },

      // Lmpid is returned when matching expected type
      { input: { lmpid: 1 }, output: { clusters: [], lmpid: "" } },
      { input: { lmpid: null }, output: { clusters: [], lmpid: "" } },
      { input: { lmpid: undefined }, output: { clusters: [], lmpid: "" } },
      { input: { lmpid: "lmpid" }, output: { clusters: [], lmpid: "lmpid" } },
    ];

    for (const c of cases) {
      expect(parseResolveResponse(c.input)).toEqual(c.output);
    }
  });
});
