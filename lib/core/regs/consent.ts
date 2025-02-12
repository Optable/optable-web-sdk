import type { Regulation } from "./regulations";
import { inferRegulation } from "./regulations";
import * as gpp from "./gpp";
import * as tcf from "./tcf";

type CMPApiConfig = {
  // An optional vendor ID from GVL (global vendor list) when interpretting TCF/GPP EU consent,
  // when not passed, defaults to publisher consent.
  tcfeuVendorID?: number;

  // An optional vendor ID from GVL (global vendor list) when interpretting GPP CA consent,
  // when not passed, defaults to publisher consent.
  tcfcaVendorID?: number;
};

type Consent = {
  // Whether the device access is granted
  deviceAccess: boolean;

  // Whether the visitor has consented to use its data for creating profiles for advertising
  createProfilesForAdvertising: boolean;

  // Whether the visitor has consented to use its data for showing personalized ads
  useProfilesForAdvertising: boolean;

  // Whether the visitor has consented to participate in advertising performance measurement
  measureAdvertisingPerformance: boolean;

  // The regulation that was detected, null if unknown
  reg: Regulation | null;

  // The GDPR string if available
  gdpr?: string;

  // Whether GDPR applies to the visitor
  gdprApplies?: boolean;

  // The GPP string if available
  gpp?: string;

  // The GPP section IDs that are applicable
  gppSectionIDs?: number[];
};

function getConsent(defaultReg: Regulation | null, conf: CMPApiConfig = {}): Consent {
  let gdprString: string | undefined;
  let gdprApplies: boolean | undefined;

  let gppString: string | undefined;
  let gppSectionIDs: number[] | undefined;

  let gdprData: tcf.cmpapi.TCData | undefined;
  let gppData: gpp.cmpapi.PingReturn | undefined;

  const applicableReg = () => {
    // If CMP indicates GDPR applies, use GDPR regulation
    if (gdprApplies === true) {
      return "gdpr";
    }

    // If CMP indicates GDPR does not apply, use unknown regulation
    if (gdprApplies === false) {
      return defaultReg === "gdpr" ? null : defaultReg;
    }

    // If CMP doesn't indicates whether GDPR applies, infer based on GPP if available
    if (typeof gppSectionIDs === "undefined" || gppSectionIDs.includes(-1)) {
      return defaultReg;
    }

    if (gpp.euSections.some((s) => gppSectionIDs?.includes(s.SectionID))) {
      return "gdpr";
    }

    if (gpp.caSections.some((s) => gppSectionIDs?.includes(s.SectionID))) {
      return "can";
    }

    if (gpp.usSections.some((s) => gppSectionIDs?.includes(s.SectionID))) {
      return "us";
    }

    return null;
  }

  const computeConsent = (): Consent => {
    const consent: Consent = {
      reg: applicableReg(),
      gpp: gppString,
      gppSectionIDs: gppSectionIDs,
      gdpr: gdprString,
      gdprApplies: gdprApplies,

      deviceAccess: false,
      createProfilesForAdvertising: false,
      useProfilesForAdvertising: false,
      measureAdvertisingPerformance: false,
    }

    switch (consent.reg) {
      case "gdpr":
        if (gdprData) {
          consent.deviceAccess = tcfPurpose(gdprData, 1, conf.tcfeuVendorID);
          consent.createProfilesForAdvertising = tcfPurpose(gdprData, 3, conf.tcfeuVendorID);
          consent.useProfilesForAdvertising = tcfPurpose(gdprData, 4, conf.tcfeuVendorID);
          consent.measureAdvertisingPerformance = tcfPurpose(gdprData, 7, conf.tcfeuVendorID);
        } else if (gppData) {
          consent.deviceAccess = gppEuPurpose(gppData, 1, conf.tcfeuVendorID);
          consent.createProfilesForAdvertising = gppEuPurpose(gppData, 3, conf.tcfeuVendorID);
          consent.useProfilesForAdvertising = gppEuPurpose(gppData, 4, conf.tcfeuVendorID);
          consent.measureAdvertisingPerformance = gppEuPurpose(gppData, 7, conf.tcfeuVendorID);
        }
        break;
      case "can":
        consent.deviceAccess = true;
        if (gppData) {
          consent.createProfilesForAdvertising = gppCanPurpose(gppData, 3, conf.tcfcaVendorID);
          consent.useProfilesForAdvertising = gppCanPurpose(gppData, 4, conf.tcfcaVendorID);
          consent.measureAdvertisingPerformance = gppCanPurpose(gppData, 7, conf.tcfcaVendorID);
        }
        break;
      case "us":
      default:
        consent.deviceAccess = true;
        consent.createProfilesForAdvertising = true;
        consent.useProfilesForAdvertising = true;
        consent.measureAdvertisingPerformance = true;
    }

    return consent;
  };

  const consent = computeConsent();

  onTCFChange((data) => {
    gdprString = data.tcString;
    gdprApplies = data.gdprApplies;
    gdprData = data;
    Object.assign(consent, computeConsent());
  });

  onGPPChange((data) => {
    gppString = data.gppString;
    gppSectionIDs = data.applicableSections;
    gppData = data;
    Object.assign(consent, computeConsent());
  });

  return consent;
}

function tcfPurpose(data: tcf.cmpapi.TCData, purpose: number, vendorID?: number): boolean {
  if (vendorID) {
    return !!data.purpose?.consents?.[purpose] && !!data.vendor?.consents?.[vendorID];
  }
  return !!data.publisher?.consents?.[purpose];
}

function gppCanPurpose(data: gpp.cmpapi.PingReturn, purpose: number, vendorID?: number): boolean {
  const includeImplied = purpose > 1;

  const section = data.parsedSections?.[gpp.tcfcav1.APIPrefix] || [];
  if (typeof vendorID === "number") {
    const coreSegment = section.find((s) => "Version" in s);
    if (!coreSegment) {
      return false;
    }
    let granted =
      coreSegment.PurposesExpressConsent.includes(purpose) && coreSegment.VendorExpressConsent.includes(vendorID);
    if (includeImplied) {
      granted ||=
        coreSegment.PurposesImpliedConsent.includes(purpose) && coreSegment.VendorImpliedConsent.includes(vendorID);
    }
    return granted;
  }

  const publisherSubsection = section.find((s) => "SubsectionType" in s && s.SubsectionType === 3);
  if (!publisherSubsection) {
    return false;
  }
  let granted = publisherSubsection.PubPurposesExpressConsent.includes(purpose);
  if (includeImplied) {
    granted ||= publisherSubsection.PubPurposesImpliedConsent.includes(purpose);
  }
  return granted;
}

function gppEuPurpose(data: gpp.cmpapi.PingReturn, purpose: number, vendorID?: number): boolean {
  const includeLegitimateInterest = purpose > 1;

  const section = data.parsedSections?.[gpp.tcfeuv2.APIPrefix] || [];
  if (typeof vendorID === "number") {
    const coreSegment = section.find((s) => "Version" in s);
    if (!coreSegment) {
      return false;
    }
    let granted = coreSegment.PurposeConsent.includes(purpose) && coreSegment.VendorConsent.includes(vendorID);
    if (includeLegitimateInterest) {
      granted ||=
        coreSegment.PurposesLITransparency.includes(purpose) && coreSegment.VendorLegitimateInterest.includes(vendorID);
    }
    return granted;
  }

  const publisherSubsection = section.find((s) => "SegmentType" in s && s.SegmentType === 3);
  if (!publisherSubsection) {
    return false;
  }
  let granted = publisherSubsection.PubPurposesConsent.includes(purpose);
  if (includeLegitimateInterest) {
    granted ||= publisherSubsection.PubPurposesLITransparency.includes(purpose);
  }
  return granted;
}

function onGPPChange(cb: (_: gpp.cmpapi.PingReturn) => void): void {
  if (!hasGPP()) {
    return;
  }

  window.__gpp?.("addEventListener", (data, success) => {
    if (!success) {
      return;
    }

    const ready = data.eventName === "signalStatus" && data.data === "ready";
    if (!ready) {
      return;
    }

    cb(data.pingData);
  });
}

function onTCFChange(cb: (_: tcf.cmpapi.TCData) => void): void {
  if (!hasTCF()) {
    return;
  }

  window.__tcfapi?.("addEventListener", 2, (data, success) => {
    if (!success) {
      return;
    }
    const ready = data.eventStatus === "tcloaded" || data.eventStatus === "useractioncomplete";
    if (!ready) {
      return;
    }
    cb(data);
  });
}

function hasGPP(): boolean {
  return typeof window.__gpp === "function";
}

function hasTCF(): boolean {
  return typeof window.__tcfapi === "function";
}

export { getConsent, inferRegulation };
export type { Consent, CMPApiConfig };
