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
    const topics = [{ topic: 1, configVersion: "v1", modelVersion: "v1", taxonomyVersion: "v1", version: "v1" }];
    const getTopicsPromise = Promise.resolve(topics);
    SDK.getTopics = jest.fn().mockImplementation(() => getTopicsPromise);

    // Call ingestTopics
    SDK.ingestTopics();

    await getTopicsPromise;

    // Expectations
    expect(SDK.getTopics).toHaveBeenCalledTimes(1);
    const expectedTopicsApi = topics.map(topic => JSON.stringify(topic)).join('|');
    expect(SDK.profile).toHaveBeenCalledWith({ topics_api: expectedTopicsApi });
  });

  test("does not profile topics when getTopics returns an empty array", async () => {
    // Mock the getTopics method to return an empty array
    const getTopicsPromise = Promise.resolve([]);
    SDK.getTopics = jest.fn().mockImplementation(() => getTopicsPromise);

    // Call ingestTopics
    SDK.ingestTopics();

    await getTopicsPromise;

    // Expectations
    expect(SDK.getTopics).toHaveBeenCalledTimes(1);
    expect(SDK.profile).not.toHaveBeenCalled();
  });

  test("does not profile topics when getTopics fails silently", async () => {
    // Mock the getTopics method to throw an error
    const getTopicsPromise = Promise.reject(new Error("Failed to retrieve topics"));
    SDK.getTopics = jest.fn().mockImplementation(() => getTopicsPromise);

    // Call ingestTopics
    SDK.ingestTopics();

    await getTopicsPromise.catch(() => { });

    // Expectations
    expect(SDK.getTopics).toHaveBeenCalledTimes(1);
    expect(SDK.profile).not.toHaveBeenCalled();
  });
});
