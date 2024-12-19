import { getConsent } from "./consent";
import * as gpp from "./gpp";

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
    const signal = mockTCFSignal(windowSpy);

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
      publisher: { consents: {} },
      tcString: "noconsent",
    });
    expect(consent.deviceAccess).toBe(false);
    expect(consent.tcf).toBe("noconsent");

    // Simulate event where purpose 1 consent is granted to the publisher
    signal({
      publisher: { consents: { 1: true } },
      tcString: "purpose1",
    });
    expect(consent.deviceAccess).toBe(true);
    expect(consent.tcf).toBe("purpose1");

    // Simulate removing consent
    signal({
      publisher: { consents: {} },
      tcString: "revoked",
    });
    expect(consent.deviceAccess).toBe(false);
    expect(consent.tcf).toBe("revoked");
  });

  it("updates consent based on gpp signals for gdpr", () => {
    const signal = mockGPPSignal(windowSpy);

    let consent = getConsent("gdpr");
    // By default device access is denied
    expect(consent.deviceAccess).toBe(false);
    expect(consent.reg).toBe("gdpr");

    // Simulate gpp ready event indicating no applicable sections
    signal({ applicableSections: [-1], gppString: "ignored" });
    expect(consent.deviceAccess).toBe(false);
    expect(consent.gpp).toBeUndefined();

    // Section tcfeuv2 applies but nothing in parsed sections
    signal({ parsedSections: {}, applicableSections: [gpp.tcfeuv2.SectionID], gppString: "noparsedsections" });
    expect(consent.deviceAccess).toBe(false);
    expect(consent.gpp).toBe("noparsedsections");
    expect(consent.gppSectionIDs).toEqual([gpp.tcfeuv2.SectionID]);

    // Section tcfeuv2 applies but no publisher segment
    signal({
      parsedSections: { [gpp.tcfeuv2.APIPrefix]: [] },
      applicableSections: [gpp.tcfeuv2.SectionID],
      gppString: "nopublishersegment",
    });
    expect(consent.deviceAccess).toBe(false);
    expect(consent.gpp).toBe("nopublishersegment");
    expect(consent.gppSectionIDs).toEqual([gpp.tcfeuv2.SectionID]);

    // Section tcfeuv2 applies but no purpose 1 consent in publisher segment
    signal({
      parsedSections: {
        [gpp.tcfeuv2.APIPrefix]: [
          {
            SegmentType: 3,
            PubPurposesConsent: [],
          },
        ],
      },
      applicableSections: [gpp.tcfeuv2.SectionID],
      gppString: "nopurpose1consent",
    });
    expect(consent.deviceAccess).toBe(false);
    expect(consent.gpp).toBe("nopurpose1consent");
    expect(consent.gppSectionIDs).toEqual([gpp.tcfeuv2.SectionID]);

    // Section tcfeuv2 applies and purpose 1 granted to publisher
    signal({
      parsedSections: {
        [gpp.tcfeuv2.APIPrefix]: [
          {
            SegmentType: 3,
            PubPurposesConsent: [1],
          },
        ],
      },
      applicableSections: [gpp.tcfeuv2.SectionID],
      gppString: "purpose1",
    });
    expect(consent.deviceAccess).toBe(true);
    expect(consent.gpp).toBe("purpose1");
    expect(consent.gppSectionIDs).toEqual([gpp.tcfeuv2.SectionID]);

    // Section tcfeuv2 applies and purpose 1 revoked
    // to publisher
    signal({
      parsedSections: {
        [gpp.tcfeuv2.APIPrefix]: [
          {
            SegmentType: 3,
            PubPurposesConsent: [],
          },
        ],
      },
      applicableSections: [gpp.tcfeuv2.SectionID],
      gppString: "revoked",
    });
    expect(consent.deviceAccess).toBe(false);
    expect(consent.gpp).toBe("revoked");
    expect(consent.gppSectionIDs).toEqual([gpp.tcfeuv2.SectionID]);

    // Given a specific vendor ID
    consent = getConsent("gdpr", { tcfeuVendorID: 42 });
    signal({
      parsedSections: {
        [gpp.tcfeuv2.APIPrefix]: [
          // Core segment
          { Version: 2, PurposeConsent: [1], VendorConsent: [42] },
          // Ignored pub segment
          { SegmentType: 3, PubPurposesConsent: [] },
        ],
      },
      applicableSections: [gpp.tcfeuv2.SectionID],
      gppString: "vendor42",
    });
    expect(consent.deviceAccess).toBe(true);
    expect(consent.gpp).toBe("vendor42");
    expect(consent.gppSectionIDs).toEqual([gpp.tcfeuv2.SectionID]);

    signal({
      parsedSections: {
        [gpp.tcfeuv2.APIPrefix]: [
          // Core segment
          { Version: 2, PurposeConsent: [1], VendorConsent: [] },
          // Ignored pub segment
          { SegmentType: 3, PubPurposesConsent: [1] },
        ],
      },
      applicableSections: [gpp.tcfeuv2.SectionID],
      gppString: "vendor42notgranted",
    });

    expect(consent.deviceAccess).toBe(false);
    expect(consent.gpp).toBe("vendor42notgranted");
    expect(consent.gppSectionIDs).toEqual([gpp.tcfeuv2.SectionID]);
  });

  it("updates consent based on gpp signals for can", () => {
    const signal = mockGPPSignal(windowSpy);

    const consent = getConsent("can");
    // Device access is always granted
    expect(consent.deviceAccess).toBe(true);
    expect(consent.reg).toBe("can");

    // Simulate gpp ready event indicating no applicable sections
    signal({ applicableSections: [-1], gppString: "ignored" });
    expect(consent.deviceAccess).toBe(true);
    expect(consent.gpp).toBeUndefined();
    expect(consent.gppSectionIDs).toBeUndefined();

    // It listens to can section changes and propagates gpp and gpp sid
    signal({ parsedSections: {}, applicableSections: [gpp.tcfcav1.SectionID], gppString: "can" });
    expect(consent.deviceAccess).toBe(true);
    expect(consent.gpp).toBe("can");
    expect(consent.gppSectionIDs).toEqual([gpp.tcfcav1.SectionID]);
  });

  it("updates consent based on gpp signals for us", () => {
    const signal = mockGPPSignal(windowSpy);

    const consent = getConsent("us");
    // Device access is always granted
    expect(consent.deviceAccess).toBe(true);
    expect(consent.reg).toBe("us");

    // Simulate gpp ready event indicating no applicable sections
    signal({ applicableSections: [-1], gppString: "ignored" });
    expect(consent.deviceAccess).toBe(true);
    expect(consent.gpp).toBeUndefined();
    expect(consent.gppSectionIDs).toBeUndefined();

    // It listens to us sections changes and propagates gpp and gpp sid
    signal({ parsedSections: {}, applicableSections: [gpp.usnat.SectionID], gppString: "usnat" });
    expect(consent.deviceAccess).toBe(true);
    expect(consent.gpp).toBe("usnat");
    expect(consent.gppSectionIDs).toEqual([gpp.usnat.SectionID]);

    signal({
      parsedSections: {},
      applicableSections: [gpp.usnat.SectionID, gpp.usca.SectionID],
      gppString: "usnat_and_usca",
    });
    expect(consent.deviceAccess).toBe(true);
    expect(consent.gpp).toBe("usnat_and_usca");
    expect(consent.gppSectionIDs).toEqual([gpp.usnat.SectionID, gpp.usca.SectionID]);
  });
});

function mockGPPSignal(windowSpy) {
  let listener;
  const gpp = jest.fn((_command, cb) => {
    listener = cb;
  });
  windowSpy.mockImplementation(() => ({ __gpp: gpp }));

  return (pingData) => {
    listener(
      {
        data: "ready",
        eventName: "signalStatus",
        pingData,
      },
      true
    );
  };
}

function mockTCFSignal(windowSpy) {
  let listener;
  const tcf = jest.fn((_command, _version, cb) => {
    listener = cb;
  });
  windowSpy.mockImplementation(() => ({ __tcfapi: tcf }));

  return (overrides) => {
    listener(
      {
        gdprApplies: true,
        eventStatus: "tcloaded",
        ...overrides,
      },
      true
    );
  };
}
