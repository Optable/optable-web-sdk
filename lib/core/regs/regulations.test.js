import { timezoneRegulation } from "./regulations";

describe("timezoneReulation", () => {
  it("should return the us regulation when given us time zone", () => {
    const timezone = "America/New_York";
    const result = timezoneRegulation(timezone);
    expect(result).toBe("us");
  });

  it("should return the gdpr regulation when given eu time zone", () => {
    const timezone = "Europe/London";
    const result = timezoneRegulation(timezone);
    expect(result).toBe("gdpr");
  });

  it("should return the can regulation when given ca time zone", () => {
    const timezone = "America/Toronto";
    const result = timezoneRegulation(timezone);
    expect(result).toBe("can");
  });
});
