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
  // The TCF string if available
  tcf?: string;
  // The GPP string if available
  gpp?: string;
  // The GPP section IDs that are applicable
  gppSectionIDs?: number[];
};

function getConsent(reg: Regulation | null, conf: CMPApiConfig = {}): Consent {
  const consent: Consent = {
    reg,
    deviceAccess: false,
    createProfilesForAdvertising: false,
    useProfilesForAdvertising: false,
    measureAdvertisingPerformance: false,
  };

  onGPPChange((data) => {
    consent.gpp = data.gppString;
    consent.gppSectionIDs = data.applicableSections;
  });

  onTCFChange((data) => {
    consent.tcf = data.gdprApplies ? data.tcString : undefined;
  });

  switch (reg) {
    case "gdpr":
      if (hasTCF()) {
        onTCFChange((data) => {
          consent.deviceAccess = tcfPurpose(data, 1, conf.tcfeuVendorID);
          consent.createProfilesForAdvertising = tcfPurpose(data, 3, conf.tcfeuVendorID);
          consent.useProfilesForAdvertising = tcfPurpose(data, 4, conf.tcfeuVendorID);
          consent.measureAdvertisingPerformance = tcfPurpose(data, 7, conf.tcfeuVendorID);
        });
      } else if (hasGPP()) {
        onGPPChange((data) => {
          consent.deviceAccess = gppEuPurpose(data, 1, conf.tcfeuVendorID);
          consent.createProfilesForAdvertising = gppEuPurpose(data, 3, conf.tcfeuVendorID);
          consent.useProfilesForAdvertising = gppEuPurpose(data, 4, conf.tcfeuVendorID);
          consent.measureAdvertisingPerformance = gppEuPurpose(data, 7, conf.tcfeuVendorID);
        });
      }
      break;
    case "can":
      consent.deviceAccess = true;
      onGPPChange((data) => {
        consent.createProfilesForAdvertising = gppCanPurpose(data, 3, conf.tcfcaVendorID);
        consent.useProfilesForAdvertising = gppCanPurpose(data, 4, conf.tcfcaVendorID);
        consent.measureAdvertisingPerformance = gppCanPurpose(data, 7, conf.tcfcaVendorID);
      });
      break;
    case "us":
    default:
      consent.deviceAccess = true;
      consent.createProfilesForAdvertising = true;
      consent.useProfilesForAdvertising = true;
      consent.measureAdvertisingPerformance = true;
  }

  return consent;
}

function tcfPurpose(data: tcf.cmpapi.TCData, purpose: number, vendorID?: number): boolean {
  if (!data.gdprApplies) {
    return true;
  }

  if (vendorID) {
    return data.purpose.consents[purpose] && data.vendor.consents[vendorID];
  }
  return !!data.publisher.consents[purpose];
}

function gppCanPurpose(data: gpp.cmpapi.PingReturn, purpose: number, vendorID?: number): boolean {
  if (!data.applicableSections.includes(gpp.tcfcav1.SectionID)) {
    return true;
  }
  const includeImplied = purpose > 1;

  const section = data.parsedSections[gpp.tcfcav1.APIPrefix] || [];
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
  if (!data.applicableSections.includes(gpp.tcfeuv2.SectionID)) {
    return true;
  }

  const includeLegitimateInterest = purpose > 1;

  const section = data.parsedSections[gpp.tcfeuv2.APIPrefix] || [];
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
