import { inferRegulation, Regulation } from "./regulations";
import { PingReturn as GPPConsentData } from "./gpp/cmpapi";
import { TCData as TCFConsentData } from "./tcf/cmpapi";
import { SectionID as TCFEuV2SectionID, APIPrefix as TCFEuV2APIPrefix } from "./gpp/tcfeuv2";
import { SectionID as TCFCaV1SectionID } from "./gpp/tcfcav1";

type Consent = {
  deviceAccess: boolean;
  reg: Regulation | null;
  tcf?: string;
  gpp?: string;
};

function gdprConsent(): Consent {
  const consent: Consent = { deviceAccess: false, reg: "gdpr" };

  // For use TCF if available, otherwise use GPP,
  // if none available assume device access is not allowed
  if (hasTCF()) {
    onTCFChange((data) => {
      consent.deviceAccess = tcfDeviceAccess(data);
      consent.tcf = data.tcString;
    });
  } else if (hasGPP()) {
    onGPPSectionChange(TCFEuV2SectionID, (data) => {
      consent.deviceAccess = gppEUDeviceAccess(data);
      consent.gpp = data.gppString;
    });
  }

  return consent;
}

function usConsent(): Consent {
  return { deviceAccess: true, reg: "us" };
}

function canConsent(): Consent {
  const consent: Consent = { deviceAccess: true, reg: "can" };
  onGPPSectionChange(TCFCaV1SectionID, (data) => {
    // Device access is always granted
    consent.gpp = data.gppString;
  });

  return consent;
}

function getConsent(reg: Regulation | null): Consent {
  switch (reg) {
    case "gdpr":
      return gdprConsent();
    case "us":
      return usConsent();
    case "can":
      return canConsent();
    default:
      return { deviceAccess: true, reg: null };
  }
}

function gppEUDeviceAccess(data: GPPConsentData): boolean {
  if (!(TCFEuV2APIPrefix in data.parsedSections)) {
    return false;
  }

  const section = data.parsedSections[TCFEuV2APIPrefix] || [];
  const publisherSubsection = section.find((s) => {
    return "SegmentType" in s && s.SegmentType === 3;
  });

  if (!publisherSubsection) {
    return false;
  }

  return (
    publisherSubsection.PubPurposesConsent.includes(1) || publisherSubsection.PubPurposesLITransparency.includes(1)
  );
}

function tcfDeviceAccess(data: TCFConsentData): boolean {
  if (!data.gdprApplies) {
    return true;
  }
  return !!data.publisher.consents["1"] || !!data.publisher.legitimateInterests["1"];
}

function onGPPSectionChange(sectionID: number, cb: (_: GPPConsentData) => void): void {
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
    if (!data.pingData.applicableSections.includes(sectionID)) {
      return;
    }
    cb(data.pingData);
  });
}

function onTCFChange(cb: (_: TCFConsentData) => void): void {
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

export default getConsent(inferRegulation());
export { Consent, getConsent };
