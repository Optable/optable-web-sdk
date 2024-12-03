import { timezoneRegion, Region } from "./region";
import { PingReturn as GPPConsentData } from "./gpp/cmpapi";
import { TCData as TCFConsentData } from "./tcf/cmpapi";
import { SectionID as TCFEuV2SectionID, APIPrefix as TCFEuV2APIPrefix } from "./gpp/tcfeuv2";
import { SectionID as TCFCaV1SectionID, APIPrefix as TCFCaV1APIPrefix } from "./gpp/tcfcav1";

type Consent = {
  deviceAccess: boolean;
  region: Region | null;
};

function getConsent(): Consent {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const region = timezoneRegion(timeZone);
  const hasGPP = typeof window.__gpp === "function";
  const hasTCF = typeof window.__tcfapi === "function";

  let consent = { deviceAccess: false, region };

  switch (region) {
    // For CA regions, use GPP if available,
    // otherwise assume device access is not allowed
    case "ca":
      if (!hasGPP) {
        break;
      }
      onGPPChange((data) => {
        consent.deviceAccess = gppCADeviceAccess(data);
      });
      break;
    // For EU regions, use GPP if available, otherwise use TCF,
    // otherwise assume device access is not allowed
    case "eu":
      if (hasGPP) {
        onGPPChange((data) => {
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
  if (!data.applicableSections.includes(TCFCaV1SectionID)) {
    return false;
  }

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
  if (!data.applicableSections.includes(TCFEuV2SectionID)) {
    return false;
  }

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

  return data.publisher.consents[1] || data.publisher.legitimateInterests[1];
}

function onGPPChange(cb: (_: GPPConsentData) => void): void {
  window.__gpp?.("addEventListener", (data, success) => {
    if (!success) {
      return;
    }
    if (data.eventName !== "signalStatus" || data.data !== "ready") {
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

    cb(data);
  });
}

export default getConsent();
