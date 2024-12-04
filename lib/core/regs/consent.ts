import { timezoneRegulation, Regulation } from "./regulations";
import { PingReturn as GPPConsentData } from "./gpp/cmpapi";
import { TCData as TCFConsentData } from "./tcf/cmpapi";
import { SectionID as TCFEuV2SectionID, APIPrefix as TCFEuV2APIPrefix } from "./gpp/tcfeuv2";
import { SectionID as TCFCaV1SectionID, APIPrefix as TCFCaV1APIPrefix } from "./gpp/tcfcav1";

type Consent = {
  deviceAccess: boolean;
  reg: Regulation | null;
};

function getConsent(): Consent {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const reg = timezoneRegulation(timeZone);
  const hasGPP = typeof window.__gpp === "function";
  const hasTCF = typeof window.__tcfapi === "function";

  let consent = { deviceAccess: false, reg };

  switch (reg) {
    // For CAN reg, use GPP if available,
    // otherwise assume device access is not allowed
    case "can":
      if (!hasGPP) {
        break;
      }
      onGPPSectionChange(TCFCaV1SectionID, (data) => {
        consent.deviceAccess = gppCADeviceAccess(data);
      });
      break;
    // For GDPR reg, use GPP if available, otherwise use TCF,
    // otherwise assume device access is not allowed
    case "gdpr":
      if (hasGPP) {
        onGPPSectionChange(TCFEuV2SectionID, (data) => {
          consent.deviceAccess = gppEUDeviceAccess(data);
        });
      } else if (hasTCF) {
        onTCFChange((data) => {
          consent.deviceAccess = tcfDeviceAccess(data);
        });
      }
      break;
    // For US and unsupported regions assume device access is allowed
    case "us":
    default:
      consent.deviceAccess = true;
      break;
  }

  return consent;
}

function gppCADeviceAccess(data: GPPConsentData): boolean {
  if (!(TCFCaV1APIPrefix in data.parsedSections)) {
    return false;
  }

  const section = data.parsedSections[TCFCaV1APIPrefix] || [];
  const publisherSubsection = section.find((s) => {
    return "SubsectionType" in s && s.SubsectionType === 3;
  });

  if (!publisherSubsection) {
    return false;
  }

  return (
    publisherSubsection.PubPurposesExpressConsent.includes(1) ||
    publisherSubsection.PubPurposesImpliedConsent.includes(1)
  );
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
  return data.publisher.consents[1] || data.publisher.legitimateInterests[1];
}

function onGPPSectionChange(sectionID: number, cb: (_: GPPConsentData) => void): void {
  window.__gpp?.("addEventListener", (data, success) => {
    if (!success) {
      return;
    }
    if (data.eventName !== "signalStatus" || data.data !== "ready") {
      return;
    }
    if (!data.pingData.applicableSections.includes(sectionID)) {
      return;
    }
    cb(data.pingData);
  });
}

function onTCFChange(cb: (_: TCFConsentData) => void): void {
  window.__tcfapi?.("addEventListener", 2, (data, success) => {
    if (!success) {
      return;
    }
    if (data.eventStatus !== "tcloaded" && data.eventStatus !== "useractioncomplete") {
      return;
    }
    if (!data.gdprApplies) {
      return;
    }
    cb(data);
  });
}

export default getConsent();
export { Consent, getConsent };
