import { inferRegulation, Regulation } from "./regulations";
import * as gpp from "./gpp";
import * as tcf from "./tcf";

type Consent = {
  deviceAccess: boolean;
  reg: Regulation | null;
  tcf?: string;
  gpp?: string;
  gppSectionIDs?: number[];
};

const gdprSectionIDs = [gpp.tcfeuv2.SectionID];

const canSectionIDs = [gpp.tcfcav1.SectionID];

const usSectionIDs = [
  gpp.usnat.SectionID,
  gpp.usca.SectionID,
  gpp.usco.SectionID,
  gpp.usct.SectionID,
  gpp.usde.SectionID,
  gpp.usfl.SectionID,
  gpp.usia.SectionID,
  gpp.usmt.SectionID,
  gpp.usne.SectionID,
  gpp.usnh.SectionID,
  gpp.usnj.SectionID,
  gpp.usor.SectionID,
  gpp.ustn.SectionID,
  gpp.ustx.SectionID,
  gpp.usut.SectionID,
  gpp.usva.SectionID,
];

function gdprConsent(): Consent {
  const consent: Consent = { deviceAccess: false, reg: "gdpr" };

  // Use TCF if available, otherwise use GPP,
  // if none available assume device access is not allowed
  if (hasTCF()) {
    onTCFChange((data) => {
      consent.deviceAccess = tcfDeviceAccess(data);
      consent.tcf = data.tcString;
    });
  } else if (hasGPP()) {
    onGPPSectionChange(gdprSectionIDs, (data) => {
      consent.deviceAccess = gppEUDeviceAccess(data);
      consent.gpp = data.gppString;
      consent.gppSectionIDs = data.applicableSections;
    });
  }

  return consent;
}

function usConsent(): Consent {
  const consent: Consent = { deviceAccess: true, reg: "us" };
  onGPPSectionChange(usSectionIDs, (data) => {
    consent.gpp = data.gppString;
    consent.gppSectionIDs = data.applicableSections;
  });

  return consent;
}

function canConsent(): Consent {
  const consent: Consent = { deviceAccess: true, reg: "can" };
  onGPPSectionChange(canSectionIDs, (data) => {
    consent.gpp = data.gppString;
    consent.gppSectionIDs = data.applicableSections;
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

function gppEUDeviceAccess(data: gpp.cmpapi.PingReturn): boolean {
  if (!(gpp.tcfeuv2.APIPrefix in data.parsedSections)) {
    return false;
  }

  const section = data.parsedSections[gpp.tcfeuv2.APIPrefix] || [];
  const publisherSubsection = section.find((s) => {
    return "SegmentType" in s && s.SegmentType === 3;
  });

  if (!publisherSubsection) {
    return false;
  }

  return publisherSubsection.PubPurposesConsent.includes(1);
}

function tcfDeviceAccess(data: tcf.cmpapi.TCData): boolean {
  if (!data.gdprApplies) {
    return true;
  }
  return !!data.publisher.consents["1"];
}

function onGPPSectionChange(sectionIDs: number[], cb: (_: gpp.cmpapi.PingReturn) => void): void {
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

    const anyChanged = sectionIDs.some((sectionID) => {
      return data.pingData.applicableSections.includes(sectionID);
    });

    if (!anyChanged) {
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

export default getConsent(inferRegulation());
export { Consent, getConsent };
