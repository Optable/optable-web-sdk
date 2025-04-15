import { generateSiteKeys, generatePassportKeys, generateTargetingKeys, encodeBase64 } from "./storage-keys";

describe("Storage Key Generation", () => {
  const mockConfig = {
    host: "example.com",
    node: "node1",
    site: "site1",
    legacyHostCache: "legacy.example.com",
  };

  test("generateSiteKeys should return correct storage keys", () => {
    const keysWithNodeConfig = generateSiteKeys(mockConfig);
    expect(keysWithNodeConfig).toEqual({
      write: ["OPTABLE_SITE_" + encodeBase64("example.com/node1")],
      read: ["OPTABLE_SITE_" + encodeBase64("example.com/node1")],
    });

    const keysWithoutNodeConfig = generateSiteKeys({ ...mockConfig, node: undefined });
    expect(keysWithoutNodeConfig).toEqual({
      write: ["OPTABLE_SITE_" + encodeBase64("example.com")],
      read: ["OPTABLE_SITE_" + encodeBase64("example.com")],
    });
  });

  test("generateTargetingKeys should return correct storage keys", () => {
    const keysWithNodeConfig = generateTargetingKeys(mockConfig);
    expect(keysWithNodeConfig).toEqual({
      write: ["OPTABLE_TARGETING_" + encodeBase64("example.com/node1")],
      read: ["OPTABLE_TARGETING_" + encodeBase64("example.com/node1")],
    });

    const keysWithoutNodeConfig = generateTargetingKeys({ ...mockConfig, node: undefined });
    expect(keysWithoutNodeConfig).toEqual({
      write: ["OPTABLE_TARGETING_" + encodeBase64("example.com")],
      read: ["OPTABLE_TARGETING_" + encodeBase64("example.com")],
    });
  });

  test("passport keys WITH NODE should write/read that first", () => {
    const keys = generatePassportKeys(mockConfig);
    expect(keys).toEqual({
      write: ["OPTABLE_PASSPORT_" + encodeBase64("example.com/node1")],
      read: [
        "OPTABLE_PASSPORT_" + encodeBase64("example.com/node1"),
        "OPTABLE_PASSPORT_" + encodeBase64("legacy.example.com"),
        "OPTABLE_PASS_" + encodeBase64("legacy.example.com/site1"),
      ],
    });
  });

  test("passport keys NO NODE should write/read that first", () => {
    const configWithoutNode = { ...mockConfig, node: undefined };
    const keys = generatePassportKeys(configWithoutNode);
    expect(keys).toEqual({
      write: ["OPTABLE_PASSPORT_" + encodeBase64("example.com")],
      read: [
        "OPTABLE_PASSPORT_" + encodeBase64("example.com"),
        "OPTABLE_PASSPORT_" + encodeBase64("legacy.example.com"),
        "OPTABLE_PASS_" + encodeBase64("legacy.example.com/site1"),
      ],
    });
  });

  test("passport keys NO LegacyHostCache doesn't use as read key", () => {
    const configWithoutLegacyHost = { ...mockConfig, legacyHostCache: undefined };
    const keys = generatePassportKeys(configWithoutLegacyHost);
    expect(keys).toEqual({
      write: ["OPTABLE_PASSPORT_" + encodeBase64("example.com/node1")],
      read: [
        "OPTABLE_PASSPORT_" + encodeBase64("example.com/node1"),
        "OPTABLE_PASS_" + encodeBase64("example.com/site1"),
      ],
    });
  });
});
