import OptableSDK from "../sdk";

describe("ingestTopics", () => {
  let SDK;

  beforeEach(() => {
    // Reset SDK instance and mock necessary methods
    SDK = new OptableSDK({ host: "localhost", site: "test" });
    // Mock the getTopics method
    SDK.getTopics = jest.fn().mockResolvedValue(["topic1", "topic2"]);
    // Mock the profile method
    SDK.profile = jest.fn();
  });

  test("profiles topics when topics are retrieved successfully", async () => {
    // Call the function being tested
    await SDK.ingestTopics();

    // Expect the getTopics method to have been called
    expect(SDK.getTopics).toHaveBeenCalledTimes(1);

    // Expect the profile method to have been called with the correct arguments
    expect(SDK.profile).toHaveBeenCalledWith({ topics_api: "topic1|topic2" });
  });

  test("does not profile topics when getTopics method fails", async () => {
    // Mock the getTopics method to reject the promise
    SDK.getTopics = jest.fn().mockRejectedValue(new Error("Failed to retrieve topics"));

    // Call the function being tested
    await expect(SDK.ingestTopics()).rejects.toThrow("Failed to retrieve topics");

    // Expect the getTopics method to have been called
    expect(SDK.getTopics).toHaveBeenCalledTimes(1);

    // Expect the profile method not to have been called
    expect(SDK.profile).not.toHaveBeenCalled();
  });

   test("does not profile topics when getTopics returns an empty array", async () => {
    // Mock the getTopics method to resolve with an empty array
    SDK.getTopics = jest.fn().mockResolvedValue([]);

    // Call the function being tested
    await SDK.ingestTopics();

    // Expect the getTopics method to have been called
    expect(SDK.getTopics).toHaveBeenCalledTimes(1);

    // Expect the profile method not to have been called
    expect(SDK.profile).not.toHaveBeenCalled();
  });
});
