type CoreSegment = {
  Version: number;
  SharingNotice: number;
  SaleOptOutNotice: number;
  SharingOptOutNotice: number;
  TargetedAdvertisingOptOutNotice: number;
  SensitiveDataProcessingOptOutNotice: number;
  SensitiveDataLimitUseNotice: number;
  SaleOptOut: number;
  SharingOptOut: number;
  TargetedAdvertisingOptOut: number;
  SensitiveDataProcessing: number[];
  KnownChildSensitiveDataConsents: number[];
  PersonalDataConsents: number;
  MspaCoveredTransaction: number;
  MspaOptOutOptionMode: number;
  MspaServiceProviderMode: number;
};

const SectionID = 7;
const APIPrefix = "usnat";

type Section = Array<CoreSegment>;

export type { Section };

export { SectionID, APIPrefix };
