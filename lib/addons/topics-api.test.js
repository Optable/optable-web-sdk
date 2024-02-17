import OptableSDK from "../sdk";
import "./topics-api.ts";

describe("OptableSDK - ingestTopics", () => {
  let SDK;

  beforeEach(() => {
    SDK = new OptableSDK({ host: "localhost", site: "test" });
    // Mock the profile method
    SDK.profile = jest.fn();
  });

  test("profiles topics when getTopics returns topics", async () => {
    // Mock the getTopics method to return topics
    const topics = [
      { topic: 583, configVersion: "chrome.2", modelVersion: "4", taxonomyVersion: "2", version: "chrome.2:2:4" },
      { topic: 582, configVersion: "chrome.2", modelVersion: "4", taxonomyVersion: "2", version: "chrome.2:2:4" },
      { topic: 583, configVersion: "chrome.1", modelVersion: "4", taxonomyVersion: "1", version: "chrome.1:2:4" },
      { topic: 582, configVersion: "chrome.1", modelVersion: "4", taxonomyVersion: "1", version: "chrome.1:2:4" }
    ];
    SDK.getTopics = jest.fn().mockResolvedValue(topics);

    // Call ingestTopics
    SDK.ingestTopics();

    await new Promise(process.nextTick);

    // Expectations
    expect(SDK.getTopics).toHaveBeenCalledTimes(1);
    expect(SDK.profile).toHaveBeenCalledWith({
      topics_v2: "583,582",
      topics_v1: "583,582",
    });
  });

  test("does not profile topics when getTopics returns an empty array", async () => {
    // Mock the getTopics method to return an empty array
    SDK.getTopics = jest.fn().mockResolvedValue([]);

    // Call ingestTopics
    SDK.ingestTopics();

    await new Promise(process.nextTick);

    // Expectations
    expect(SDK.getTopics).toHaveBeenCalledTimes(1);
    expect(SDK.profile).not.toHaveBeenCalled();
  });

  test("does not profile topics when getTopics fails silently", async () => {
    // Mock the getTopics method to throw an error
    SDK.getTopics = jest.fn().mockRejectedValue(new Error("Failed to retrieve topics"))

    // Call ingestTopics
    SDK.ingestTopics();

    await new Promise(process.nextTick);

    // Expectations
    expect(SDK.getTopics).toHaveBeenCalledTimes(1);
    expect(SDK.profile).not.toHaveBeenCalled();
  });
});
