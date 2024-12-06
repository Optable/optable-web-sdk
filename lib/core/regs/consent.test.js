import { getConsent } from "./consent";
import "@iabgpp/stub";
import { CmpApi } from "@iabgpp/cmpapi";
import { SectionID as TCFCaV1SectionID, APIPrefix as TCFCaV1APIPrefix } from "./gpp/tcfcav1";

describe("getConsent", () => {
  const purposeOneBitField = new Array(24).fill(false);
  purposeOneBitField[0] = true;

  let mockTimezone = "";

  beforeEach(() => {
    jest.spyOn(Intl, "DateTimeFormat").mockImplementation(() => ({
      resolvedOptions: () => ({
        timeZone: mockTimezone,
      }),
    }));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("allows device access when regulation is unknown", () => {
    const result = getConsent();
    expect(result).toEqual({ deviceAccess: true, reg: null });
  });

  it("allows device access when regulation is us", () => {
    mockTimezone = "America/New_York";
    const result = getConsent();
    expect(result).toEqual({ deviceAccess: true, reg: "us" });
  });

  it("initially denies device access when regulation is gdpr", () => {
    mockTimezone = "Europe/London";
    const result = getConsent();
    expect(result).toEqual({ deviceAccess: false, reg: "gdpr" });
  });

  it("initially denies device access when regulation is can", () => {
    mockTimezone = "America/Toronto";
    const result = getConsent();
    expect(result).toEqual({ deviceAccess: false, reg: "can" });
  });

  it("updates device access based on in-page gpp cmpapi signals", () => {
    mockTimezone = "America/Toronto";
    const result = getConsent();
    expect(result).toEqual({ deviceAccess: false, reg: "can" });

    const cmpapi = new CmpApi(0, 0);
    cmpapi.setFieldValue(TCFCaV1APIPrefix, "PubPurposesExpressConsent", purposeOneBitField);
    cmpapi.setApplicableSections([TCFCaV1SectionID]);
    cmpapi.fireSectionChange(TCFCaV1APIPrefix);
    cmpapi.setSignalStatus("ready");

    expect(result.deviceAccess).toBe(true);
  });
});
