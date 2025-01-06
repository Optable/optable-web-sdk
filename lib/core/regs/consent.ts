import type { CMPApiConfig } from "config";
import type { Regulation } from "./regulations";
import { inferRegulation } from "./regulations";
import * as gpp from "./gpp";
import * as tcf from "./tcf";

type Consent = {
  // Whether the device access is granted
  deviceAccess: boolean;
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
  const consent: Consent = { deviceAccess: true, reg };

  onGPPChange((data) => {
    consent.gpp = data.gppString;
    consent.gppSectionIDs = data.applicableSections;
  });

  onTCFChange((data) => {
    consent.tcf = data.gdprApplies ? data.tcString : undefined;
  });

  if (reg === "gdpr") {
    consent.deviceAccess = false;
    if (hasTCF()) {
      onTCFChange((data) => {
        consent.deviceAccess = tcfDeviceAccess(data, conf.tcfeuVendorID);
      });
    } else if (hasGPP()) {
      onGPPChange((data) => {
        consent.deviceAccess = gppEUDeviceAccess(data, conf.tcfeuVendorID);
      });
    }
  }

  return consent;
}

function gppEUDeviceAccess(data: gpp.cmpapi.PingReturn, vendorID?: number): boolean {
  if (!data.applicableSections.includes(gpp.tcfeuv2.SectionID)) {
    return true;
  }

  const section = data.parsedSections[gpp.tcfeuv2.APIPrefix] || [];

  if (typeof vendorID === "number") {
    const coreSegment = section.find((s) => {
      return "Version" in s;
    });

    if (!coreSegment) {
      return false;
    }

    return coreSegment.PurposeConsent.includes(1) && coreSegment.VendorConsent.includes(vendorID);
  }

  const publisherSubsection = section.find((s) => {
    return "SegmentType" in s && s.SegmentType === 3;
  });

  if (!publisherSubsection) {
    return false;
  }

  return publisherSubsection.PubPurposesConsent.includes(1);
}

function tcfDeviceAccess(data: tcf.cmpapi.TCData, vendorID?: number): boolean {
  if (!data.gdprApplies) {
    return true;
  }

  if (vendorID) {
    return data.purpose.consents["1"] && data.vendor.consents[vendorID];
  }

  return !!data.publisher.consents["1"];
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
export type { Consent };
