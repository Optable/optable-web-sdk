import { getConsent } from "./consent";
import { SectionID as TCFEuV2SectionID, APIPrefix as TCFEuV2APIPrefix } from "./gpp/tcfeuv2";
import { SectionID as TCFCaV1SectionID, APIPrefix as TCFCaV1APIPrefix } from "./gpp/tcfcav1";

describe("getConsent", () => {
  let windowSpy;

  beforeEach(() => {
    windowSpy = jest.spyOn(window, "window", "get");
  });

  afterEach(() => {
    windowSpy.mockRestore();
  });

  it("allows device access when regulation is unknown", () => {
    const result = getConsent(null);
    expect(result).toEqual({ deviceAccess: true, reg: null });
  });

  it("allows device access when regulation is us", () => {
    const result = getConsent("us");
    expect(result).toEqual({ deviceAccess: true, reg: "us" });
  });

  it("allows device access when regulation is can", () => {
    const result = getConsent("can");
    expect(result).toEqual({ deviceAccess: true, reg: "can" });
  });

  it("initially denies device access when regulation is gdpr", () => {
    const result = getConsent("gdpr");
    expect(result).toEqual({ deviceAccess: false, reg: "gdpr" });
  });

  it("prefers tcf over gpp for gdpr when both present", () => {
    const tcfapi = jest.fn();
    const gpp = jest.fn();

    windowSpy.mockImplementation(() => ({
      __tcfapi: tcfapi,
      __gpp: gpp,
    }));

    getConsent("gdpr");

    expect(tcfapi).toHaveBeenCalled();
    expect(gpp).not.toHaveBeenCalled();
  });

  it("fallsback to gpp for gdpr when tcf absent", () => {
    const gpp = jest.fn();

    windowSpy.mockImplementation(() => ({
      __gpp: gpp,
    }));

    getConsent("gdpr");

    expect(gpp).toHaveBeenCalled();
  });

  it("updates consent based on tcf signals for gdpr", () => {
    let listener;
    const tcf = jest.fn((_command, _version, cb) => {
      listener = cb;
    });
    windowSpy.mockImplementation(() => ({ __tcfapi: tcf }));

    const signal = (overrides) => {
      listener(
        {
          gdprApplies: true,
          eventStatus: "tcloaded",
          ...overrides,
        },
        true
      );
    };

    const consent = getConsent("gdpr");
    // By default device access is denied
    expect(consent.deviceAccess).toBe(false);
    expect(consent.reg).toBe("gdpr");

    // Simulate event indicating that gdpr doesn't apply
    signal({ gdprApplies: false, tcString: "doesntapply" });
    expect(consent.deviceAccess).toBe(true);
    expect(consent.tcf).toBe("doesntapply");

    // Simulate event where no consent is granted
    signal({
      publisher: { consents: {}, legitimateInterests: {} },
      tcString: "noconsent",
    });
    expect(consent.deviceAccess).toBe(false);
    expect(consent.tcf).toBe("noconsent");

    // Simulate event where purpose 1 consent is granted to the publisher
    signal({
      publisher: { consents: { 1: true }, legitimateInterests: {} },
      tcString: "purpose1",
    });
    expect(consent.deviceAccess).toBe(true);
    expect(consent.tcf).toBe("purpose1");

    // Simulate event where purpose 1 consent is legitimate interest to the publisher
    signal({
      publisher: { consents: {}, legitimateInterests: { 1: true } },
      tcString: "purpose1li",
    });
    expect(consent.deviceAccess).toBe(true);
    expect(consent.tcf).toBe("purpose1li");

    // Simulate removing consent
    signal({
      publisher: { consents: {}, legitimateInterests: {} },
      tcString: "revoked",
    });
    expect(consent.deviceAccess).toBe(false);
    expect(consent.tcf).toBe("revoked");
  });

  it("updates consent based on gpp signals for gdpr", () => {
    let listener;
    const gpp = jest.fn((_command, cb) => {
      listener = cb;
    });
    windowSpy.mockImplementation(() => ({ __gpp: gpp }));

    const consent = getConsent("gdpr");
    // By default device access is denied
    expect(consent.deviceAccess).toBe(false);
    expect(consent.reg).toBe("gdpr");

    const signal = (pingData) => {
      listener(
        {
          data: "ready",
          eventName: "signalStatus",
          pingData,
        },
        true
      );
    };

    // Simulate gpp ready event indicating no applicable sections
    signal({ applicableSections: [-1], gppString: "ignored" });
    expect(consent.deviceAccess).toBe(false);
    expect(consent.gpp).toBeUndefined();

    // Section tcfeuv2 applies but nothing in parsed sections
    signal({ parsedSections: {}, applicableSections: [TCFEuV2SectionID], gppString: "noparsedsections" });
    expect(consent.deviceAccess).toBe(false);
    expect(consent.gpp).toBe("noparsedsections");

    // Section tcfeuv2 applies but no publisher segment
    signal({
      parsedSections: { [TCFEuV2APIPrefix]: [] },
      applicableSections: [TCFEuV2SectionID],
      gppString: "nopublishersegment",
    });
    expect(consent.deviceAccess).toBe(false);
    expect(consent.gpp).toBe("nopublishersegment");

    // Section tcfeuv2 applies but no purpose 1 consent in publisher segment
    signal({
      parsedSections: {
        [TCFEuV2APIPrefix]: [
          {
            SegmentType: 3,
            PubPurposesConsent: [],
            PubPurposesLITransparency: [],
          },
        ],
      },
      applicableSections: [TCFEuV2SectionID],
      gppString: "nopurpose1consent",
    });
    expect(consent.deviceAccess).toBe(false);
    expect(consent.gpp).toBe("nopurpose1consent");

    // Section tcfeuv2 applies and purpose 1 granted to publisher
    signal({
      parsedSections: {
        [TCFEuV2APIPrefix]: [
          {
            SegmentType: 3,
            PubPurposesConsent: [1],
            PubPurposesLITransparency: [],
          },
        ],
      },
      applicableSections: [TCFEuV2SectionID],
      gppString: "purpose1",
    });
    expect(consent.deviceAccess).toBe(true);
    expect(consent.gpp).toBe("purpose1");

    // Section tcfeuv2 applies and purpose 1 granted as legitimate interest
    // to publisher
    signal({
      parsedSections: {
        [TCFEuV2APIPrefix]: [
          {
            SegmentType: 3,
            PubPurposesConsent: [],
            PubPurposesLITransparency: [1],
          },
        ],
      },
      applicableSections: [TCFEuV2SectionID],
      gppString: "purpose1li",
    });
    expect(consent.deviceAccess).toBe(true);
    expect(consent.gpp).toBe("purpose1li");

    // Section tcfeuv2 applies and purpose 1 revoked
    // to publisher
    signal({
      parsedSections: {
        [TCFEuV2APIPrefix]: [
          {
            SegmentType: 3,
            PubPurposesConsent: [],
            PubPurposesLITransparency: [],
          },
        ],
      },
      applicableSections: [TCFEuV2SectionID],
      gppString: "revoked",
    });
    expect(consent.deviceAccess).toBe(false);
    expect(consent.gpp).toBe("revoked");
  });

  it("updates consent based on gpp signals for can", () => {
    let listener;
    const gpp = jest.fn((_command, cb) => {
      listener = cb;
    });
    windowSpy.mockImplementation(() => ({ __gpp: gpp }));

    const consent = getConsent("can");
    // Device access is always granted
    expect(consent.deviceAccess).toBe(true);
    expect(consent.reg).toBe("can");

    const signal = (pingData) => {
      listener(
        {
          data: "ready",
          eventName: "signalStatus",
          pingData,
        },
        true
      );
    };

    // Simulate gpp ready event indicating no applicable sections
    signal({ applicableSections: [-1], gppString: "ignored" });
    expect(consent.deviceAccess).toBe(true);
    expect(consent.gpp).toBeUndefined();

    // Section tcfcav1 applies but nothing in parsed sections doesn't impact
    // device access
    signal({ parsedSections: {}, applicableSections: [TCFCaV1SectionID], gppString: "noparsedsections" });
    expect(consent.deviceAccess).toBe(true);
    expect(consent.gpp).toBe("noparsedsections");
  });
});
