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

type CMPSignals = {
  gdprString?: string;
  gdprApplies?: boolean;
  gdprData?: tcf.cmpapi.TCData;

  gppString?: string;
  gppSectionIDs?: number[];
  gppData?: gpp.cmpapi.PingReturn;
};

function applicableReg(defaultReg: Regulation | null, cmp: CMPSignals): Regulation | null {
  const { gdprApplies, gppSectionIDs, gdprData } = cmp;

  // Handle TCF signaling (preferred over GPP)
  if (typeof gdprApplies !== "undefined") {
    if (gdprApplies) {
      return "gdpr";
    }

    // Override with unknown regulation if CMP indicates gdpr doesn't apply
    return defaultReg === "gdpr" ? null : defaultReg;
  }

  // gdprApplies is optional, so gdprData presence is necessary
  if (typeof gdprData !== "undefined" && defaultReg === "gdpr") {
    return "gdpr";
  }

  // Handle GPP signaling
  //
  // Unknown regulation signal
  if (typeof gppSectionIDs === "undefined" || (gppSectionIDs.length === 1 && gppSectionIDs[0] === 0)) {
    return defaultReg;
  }

  // No applicable regulation
  if (gppSectionIDs.length === 1 && gppSectionIDs[0] === -1) {
    return null;
  }

  // GDPR > CAN > US
  if (gppSectionIDs.some((sid) => gpp.euSectionIDs.includes(sid))) {
    return "gdpr";
  }

  if (gppSectionIDs.some((sid) => gpp.caSectionIDs.includes(sid))) {
    return "can";
  }

  if (gppSectionIDs.some((sid) => gpp.usSectionIDs.includes(sid))) {
    return "us";
  }

  // Override with unknown regulation if CMP indicates the detected
  // regulation doesn't apply
  switch (defaultReg) {
    case "gdpr":
      if (!gppSectionIDs.some((sid) => gpp.euSectionIDs.includes(sid))) {
        return null;
      }
      break;
    case "can":
      if (!gppSectionIDs.some((sid) => gpp.caSectionIDs.includes(sid))) {
        return null;
      }
      break;
    case "us":
      if (!gppSectionIDs.some((sid) => gpp.usSectionIDs.includes(sid))) {
        return null;
      }
      break;
  }

  return defaultReg;
}

function computeConsent(defaultReg: Regulation | null, cmp: CMPSignals, conf: CMPApiConfig = {}): Consent {
  const reg = applicableReg(defaultReg, cmp);

  const consent: Consent = {
    reg,
    gpp: cmp.gppString,
    gppSectionIDs: cmp.gppSectionIDs,
    gdpr: cmp.gdprString,
    gdprApplies: cmp.gdprApplies,

    deviceAccess: false,
    createProfilesForAdvertising: false,
    useProfilesForAdvertising: false,
    measureAdvertisingPerformance: false,
  };

  switch (reg) {
    case "gdpr":
      if (cmp.gdprData) {
        consent.deviceAccess = tcfPurpose(cmp.gdprData, 1, conf.tcfeuVendorID);
        consent.createProfilesForAdvertising = tcfPurpose(cmp.gdprData, 3, conf.tcfeuVendorID);
        consent.useProfilesForAdvertising = tcfPurpose(cmp.gdprData, 4, conf.tcfeuVendorID);
        consent.measureAdvertisingPerformance = tcfPurpose(cmp.gdprData, 7, conf.tcfeuVendorID);
      } else if (cmp.gppData) {
        consent.deviceAccess = gppEuPurpose(cmp.gppData, 1, conf.tcfeuVendorID);
        consent.createProfilesForAdvertising = gppEuPurpose(cmp.gppData, 3, conf.tcfeuVendorID);
        consent.useProfilesForAdvertising = gppEuPurpose(cmp.gppData, 4, conf.tcfeuVendorID);
        consent.measureAdvertisingPerformance = gppEuPurpose(cmp.gppData, 7, conf.tcfeuVendorID);
      }
      break;
    case "can":
      consent.deviceAccess = true;
      if (cmp.gppData) {
        consent.createProfilesForAdvertising = gppCanPurpose(cmp.gppData, 3, conf.tcfcaVendorID);
        consent.useProfilesForAdvertising = gppCanPurpose(cmp.gppData, 4, conf.tcfcaVendorID);
        consent.measureAdvertisingPerformance = gppCanPurpose(cmp.gppData, 7, conf.tcfcaVendorID);
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
}

function getConsent(defaultReg: Regulation | null, conf: CMPApiConfig = {}): Consent {
  const cmp: CMPSignals = {};
  const consent = computeConsent(defaultReg, cmp, conf);

  onTCFChange((data) => {
    cmp.gdprString = data.tcString;
    cmp.gdprApplies = data.gdprApplies;
    cmp.gdprData = data;
    Object.assign(consent, computeConsent(defaultReg, cmp, conf));
  });

  onGPPChange((data) => {
    cmp.gppString = data.gppString;
    cmp.gppSectionIDs = data.applicableSections;
    cmp.gppData = data;
    Object.assign(consent, computeConsent(defaultReg, cmp, conf));
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

export { getConsent, inferRegulation, applicableReg };
export type { Consent, CMPApiConfig };
