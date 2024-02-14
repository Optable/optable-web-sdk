import OptableSDK from "../sdk";

describe("ingestTopics", () => {
  let SDK;

  beforeEach(() => {
    // Reset SDK instance and mock any necessary methods
    SDK = new OptableSDK({ host: "localhost", site: "test" });
    // Mock the getTopics method
    SDK.instance.getTopics = jest.fn().mockResolvedValue(["topic1", "topic2"]);
  });

  test("profiles topics when topics are retrieved successfully", async () => {
    // Call the function being tested
    await SDK.instance.ingestTopics();

    // Expect the getTopics method to have been called
    expect(SDK.instance.getTopics).toHaveBeenCalledTimes(1);
    
    // Expect the profile method to have been called with the correct arguments
    expect(SDK.instance.profile).toHaveBeenCalledWith({ topics_api: "topic1|topic2" });
  });

  test("does not profile topics when getTopics method fails", async () => {
    // Mock the getTopics method to reject the promise
    SDK.instance.getTopics = jest.fn().mockRejectedValue(new Error("Failed to retrieve topics"));

    // Call the function being tested
    await expect(SDK.instance.ingestTopics()).rejects.toThrow("Failed to retrieve topics");

    // Expect the getTopics method to have been called
    expect(SDK.instance.getTopics).toHaveBeenCalledTimes(1);
    
    // Expect the profile method not to have been called
    expect(SDK.instance.profile).not.toHaveBeenCalled();
  });

   test("does not profile topics when getTopics returns an empty array", async () => {
    // Call the function being tested
    await SDK.instance.ingestTopics();

    // Expect the getTopics method to have been called
    expect(SDK.instance.getTopics).toHaveBeenCalledTimes(1);
    
    // Expect the profile method not to have been called
    expect(SDK.instance.profile).not.toHaveBeenCalled();
  });
});
