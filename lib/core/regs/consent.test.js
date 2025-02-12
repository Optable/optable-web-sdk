import { getConsent, applicableReg } from "./consent";
import * as gpp from "./gpp";

const allowAll = {
  deviceAccess: true,
  createProfilesForAdvertising: true,
  useProfilesForAdvertising: true,
  measureAdvertisingPerformance: true,
};

const denyAll = {
  deviceAccess: false,
  createProfilesForAdvertising: false,
  useProfilesForAdvertising: false,
  measureAdvertisingPerformance: false,
};

describe("applicableReg", () => {
  it("returns gdpr when cmp indicates gdpr applies", () => {
    expect(applicableReg("can", { gdprApplies: true })).toBe("gdpr");
    expect(applicableReg("us", { gdprApplies: true })).toBe("gdpr");
    expect(applicableReg(null, { gdprApplies: true })).toBe("gdpr");

    expect(applicableReg("can", { gppSectionIDs: [2] })).toBe("gdpr");
    expect(applicableReg("us", { gppSectionIDs: [2] })).toBe("gdpr");
    expect(applicableReg(null, { gppSectionIDs: [2] })).toBe("gdpr");
  });

  it("returns can when cmp indicates can applies", () => {
    expect(applicableReg("gdpr", { gppSectionIDs: [5] })).toBe("can");
    expect(applicableReg("us", { gppSectionIDs: [5] })).toBe("can");
    expect(applicableReg(null, { gppSectionIDs: [5] })).toBe("can");
  });

  it("returns us when cmp indicates us applies", () => {
    expect(applicableReg("gdpr", { gppSectionIDs: [7] })).toBe("us");
    expect(applicableReg("can", { gppSectionIDs: [7] })).toBe("us");
    expect(applicableReg(null, { gppSectionIDs: [7] })).toBe("us");
  });

  it("returns unknown when cmp indicates detected regulation does not apply", () => {
    expect(applicableReg("gdpr", { gdprApplies: false })).toBe(null);
    expect(applicableReg("gdpr", { gppSectionIDs: [999] })).toBe(null);
    expect(applicableReg("gdpr", { gppSectionIDs: [-1] })).toBe(null);

    expect(applicableReg("can", { gppSectionIDs: [999] })).toBe(null);
    expect(applicableReg("can", { gppSectionIDs: [-1] })).toBe(null);

    expect(applicableReg("us", { gppSectionIDs: [999] })).toBe(null);
    expect(applicableReg("us", { gppSectionIDs: [-1] })).toBe(null);
  });

  it("returns reg until cmp knows", () => {
    expect(applicableReg("gdpr", {})).toBe("gdpr");
    expect(applicableReg("gdpr", { gppSectionIDs: [0] })).toBe("gdpr");

    expect(applicableReg("can", {})).toBe("can");
    expect(applicableReg("can", { gppSectionIDs: [0] })).toBe("can");

    expect(applicableReg("us", {})).toBe("us");
    expect(applicableReg("us", { gppSectionIDs: [0] })).toBe("us");
  });
});

describe("getConsent", () => {
  afterEach(() => {
    Object.defineProperties(window, {
      __tcfapi: {
        value: undefined,
        writable: true,
      },
      __gpp: {
        value: undefined,
        writable: true,
      },
    });
  });

  it("allows all when regulation is unknown", () => {
    const result = getConsent(null);
    expect(result).toEqual({ ...allowAll, reg: null });
  });

  it("allows all when regulation is us", () => {
    const result = getConsent("us");
    expect(result).toEqual({ ...allowAll, reg: "us" });
  });

  it("initially only allows device access when regulation is can", () => {
    const result = getConsent("can");
    expect(result).toEqual({
      ...denyAll,
      deviceAccess: true,
      reg: "can",
    });
  });

  it("initially denies all when regulation is gdpr", () => {
    const result = getConsent("gdpr");
    expect(result).toEqual({ ...denyAll, reg: "gdpr" });
  });

  it("updates consent based on tcf signals for gdpr", () => {
    const signal = mockTCFSignal();

    const consent = getConsent("gdpr");
    // By default device access is denied
    expect(consent.deviceAccess).toBe(false);
    expect(consent.reg).toBe("gdpr");

    // Simulate event indicating that gdpr doesn't apply
    signal(tcfData({ gdprApplies: false, tcString: "doesntapply" }));
    expect(consent.deviceAccess).toBe(true);
    expect(consent.gdpr).toBe("doesntapply");

    // Simulate event where no consent is granted
    signal(
      tcfData({
        publisher: { consents: {} },
        tcString: "noconsent",
      })
    );
    expect(consent.deviceAccess).toBe(false);
    expect(consent.gdpr).toBe("noconsent");

    // Simulate event where purpose 1 consent is granted to the publisher
    signal(
      tcfData({
        publisher: { consents: { 1: true } },
        tcString: "purpose1",
      })
    );
    expect(consent.deviceAccess).toBe(true);
    expect(consent.gdpr).toBe("purpose1");

    // Simulate removing consent
    signal(
      tcfData({
        publisher: { consents: {} },
        tcString: "revoked",
      })
    );
    expect(consent.deviceAccess).toBe(false);
    expect(consent.gdpr).toBe("revoked");
  });

  it("updates consent based on gpp signals for gdpr", () => {
    const signal = mockGPPSignal();

    let consent = getConsent("gdpr");
    // By default device access is denied
    expect(consent.deviceAccess).toBe(false);
    expect(consent.reg).toBe("gdpr");

    // Simulate gpp ready event indicating applicable sections unknown
    signal({ applicableSections: [0], gppString: "ignored" });
    expect(consent.deviceAccess).toBe(false);
    expect(consent.gpp).toBe("ignored");
    expect(consent.gppSectionIDs).toEqual([0]);

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
        [gpp.tcfeuv2.APIPrefix]: [gppEuPub({ SegmentType: 3 })],
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
        [gpp.tcfeuv2.APIPrefix]: [gppEuPub({ SegmentType: 3, PubPurposesConsent: [1] })],
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
        [gpp.tcfeuv2.APIPrefix]: [gppEuPub({ SegmentType: 3 })],
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
          gppEuCore({ Version: 2, PurposeConsent: [1], VendorConsent: [42] }),
          // Ignored pub segment
          gppEuPub({ SegmentType: 3 }),
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
          gppEuCore({ Version: 2, PurposeConsent: [1] }),
          // Ignored pub segment
          gppEuPub({ SegmentType: 3, PubPurposesConsent: [1] }),
        ],
      },
      applicableSections: [gpp.tcfeuv2.SectionID],
      gppString: "vendor42notgranted",
    });

    expect(consent.deviceAccess).toBe(false);
    expect(consent.gpp).toBe("vendor42notgranted");
    expect(consent.gppSectionIDs).toEqual([gpp.tcfeuv2.SectionID]);
  });

  it("prefers tcf api over gpp when both available for gdpr", () => {
    const gppSignal = mockGPPSignal();
    const tcfSignal = mockTCFSignal();

    const consent = getConsent("gdpr");

    // By default device access is denied
    expect(consent.deviceAccess).toBe(false);

    // Grant consent via gpp api
    gppSignal({
      parsedSections: {
        [gpp.tcfeuv2.APIPrefix]: [gppEuPub({ SegmentType: 3, PubPurposesConsent: [1] })],
      },
      applicableSections: [gpp.tcfeuv2.SectionID],
      gppString: "granted",
    });

    // Revoke consent via tcf api
    tcfSignal(
      tcfData({
        publisher: { consents: {} },
        tcString: "revoked",
      })
    );

    // Only tcf api is considered
    expect(consent.deviceAccess).toBe(false);

    // Revoke consent via gpp api
    gppSignal({
      parsedSections: {
        [gpp.tcfeuv2.APIPrefix]: [gppEuPub({ SegmentType: 3 })],
      },
      applicableSections: [gpp.tcfeuv2.SectionID],
      gppString: "revoked",
    });

    // Grant consent via tcf api
    tcfSignal(
      tcfData({
        publisher: { consents: { 1: true } },
        tcString: "granted",
      })
    );

    expect(consent.deviceAccess).toBe(true);
    expect(consent.gdpr).toBe("granted");
    expect(consent.gpp).toBe("revoked");
  });

  it("updates consent based on gpp signals for can", () => {
    const signal = mockGPPSignal();

    const consent = getConsent("can");
    // Device access is always granted
    expect(consent.deviceAccess).toBe(true);
    expect(consent.reg).toBe("can");

    // Simulate gpp ready event indicating no applicable sections
    signal({ applicableSections: [-1], gppString: "ignored" });
    expect(consent.deviceAccess).toBe(true);
    expect(consent.gpp).toEqual("ignored");
    expect(consent.gppSectionIDs).toEqual([-1]);

    // It listens to can section changes and propagates gpp and gpp sid
    signal({ parsedSections: {}, applicableSections: [gpp.tcfcav1.SectionID], gppString: "can" });
    expect(consent.deviceAccess).toBe(true);
    expect(consent.gpp).toBe("can");
    expect(consent.gppSectionIDs).toEqual([gpp.tcfcav1.SectionID]);
  });

  it("updates consent based on gpp signals for us", () => {
    const signal = mockGPPSignal();

    const consent = getConsent("us");
    // Device access is always granted
    expect(consent.deviceAccess).toBe(true);
    expect(consent.reg).toBe("us");

    // Simulate gpp ready event indicating no applicable sections
    signal({ applicableSections: [-1], gppString: "ignored" });
    expect(consent.deviceAccess).toBe(true);
    expect(consent.gpp).toBe("ignored");
    expect(consent.gppSectionIDs).toEqual([-1]);

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

function mockGPPSignal() {
  const listeners = [];
  window.__gpp = (_command, cb) => {
    listeners.push(cb);
  };

  return (pingData) => {
    for (const listener of listeners) {
      listener(
        {
          data: "ready",
          eventName: "signalStatus",
          pingData,
        },
        true
      );
    }
  };
}

function mockTCFSignal() {
  const listeners = [];

  window.__tcfapi = (_command, _version, cb) => {
    listeners.push(cb);
  };

  return (tcdata) => {
    for (const listener of listeners) {
      listener(tcdata, true);
    }
  };
}

function gppCanCore(overrides = {}) {
  return {
    Version: 2,
    Created: new Date(),
    LastUpdated: new Date(),
    CmpId: 1,
    CmpVersion: 1,
    ConsentScreen: 1,
    ConsentLanguage: "en",
    VendorListVersion: 1,
    TcfPolicyVersion: 2,
    UseNonStandardStacks: false,
    SpecialFeatureExpressConsent: [],
    PurposesExpressConsent: [],
    PurposesImpliedConsent: [],
    VendorExpressConsent: [],
    VendorImpliedConsent: [],
    PubRestrictions: [],
    ...overrides,
  };
}

function gppCanPub(overrides = {}) {
  return {
    SegmentType: 3,
    PubPurposesExpressConsent: [],
    PubPurposesImpliedConsent: [],
    NumCustomPurposes: 0,
    CustomPurposesExpressConsent: [],
    CustomPurposesImpliedConsent: [],
    ...overrides,
  };
}

function gppEuCore(overrides = {}) {
  return {
    Version: 2,
    Created: new Date(),
    LastUpdated: new Date(),
    CmpId: 1,
    CmpVersion: 1,
    ConsentScreen: 1,
    ConsentLanguage: "en",
    VendorListVersion: 1,
    TcfPolicyVersion: 2,
    IsServiceSpecific: false,
    UseNonStandardTexts: false,
    SpecialFeatureOptIns: [],
    PurposeConsent: [],
    PurposesLITransparency: [],
    PurposeOneTreatment: false,
    PublisherCC: "US",
    VendorConsent: [],
    VendorLegitimateInterest: [],
    PubRestrictions: [],
    ...overrides,
  };
}

function gppEuPub(overrides = {}) {
  return {
    SegmentType: 3,
    PubPurposesConsent: [],
    PubPurposesLITransparency: [],
    NumCustomPurposes: 0,
    CustomPurposesConsent: [],
    CustomPurposesLITransparency: [],
    ...overrides,
  };
}

function tcfData(overrides = {}) {
  return {
    tcString: "",
    tcfPolicyVersion: 2,
    cmpId: 1,
    cmpVersion: 1,
    gdprApplies: true,
    eventStatus: "tcloaded",
    cmpStatus: "loaded",
    listenerId: 0,
    isServiceSpecific: false,
    useNonStandardStacks: false,
    publisherCC: "US",
    purposeOneTreatment: false,
    purpose: {
      consents: {},
      legitimateInterests: {},
    },
    vendor: {
      consents: {},
      legitimateInterests: {},
    },
    specialFeatureOptins: {},
    publisher: {
      consents: {},
      legitimateInterests: {},
      customPurpose: {
        consents: {},
        legitimateInterests: {},
      },
      restrictions: {},
    },
    ...overrides,
  };
}
