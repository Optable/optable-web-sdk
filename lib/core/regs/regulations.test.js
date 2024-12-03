import { inferRegulation } from "./regulations";

describe("inferRegulation", () => {
  let timezoneMock = "";
  let languagesMock = [];

  beforeEach(() => {
    jest.spyOn(Intl, "DateTimeFormat").mockImplementation(() => ({
      resolvedOptions: () => ({
        timeZone: timezoneMock,
      }),
    }));

    jest.spyOn(navigator, "languages", "get").mockImplementation(() => languagesMock);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should return the us regulation when given us time zone", () => {
    timezoneMock = "America/New_York";
    expect(inferRegulation()).toBe("us");
  });

  it("should return the gdpr regulation when given eu time zone", () => {
    timezoneMock = "Europe/Paris";
    expect(inferRegulation()).toBe("gdpr");
  });

  it("should return the can regulation when infered to be in quebec", () => {
    timezoneMock = "America/Toronto";
    expect(inferRegulation()).toBeNull();

    languagesMock = ["en", "fr-FR"];
    expect(inferRegulation()).toBeNull();

    languagesMock = ["en", "fr-CA"];
    expect(inferRegulation()).toBe("can");

    languagesMock = ["en", "fr"];
    expect(inferRegulation()).toBe("can");
  });
});
