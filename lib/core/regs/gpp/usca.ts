type CoreSubsection = {
  Version: number;
  SaleOptOutNotice: number;
  SharingOptOutNotice: number;
  SensitiveDataLimitUseNotice: number;
  SaleOptOut: number;
  SharingOptOut: number;
  SensitiveDataProcessing: number[];
  KnownChildSensitiveDataConsents: number[];
  PersonalDataConsents: number;
  MspaCoveredTransaction: number;
  MspaOptOutOptionMode: number;
  MspaServiceProviderMode: number;
};

type Section = Array<CoreSubsection>;

const SectionID = 8;
const APIPrefix = "usca";

export type { Section };

export { SectionID, APIPrefix };
