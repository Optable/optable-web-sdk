type CoreSubsection = {
  Version: number;
  SharingNotice: number;
  SaleOptOutNotice: number;
  TargetedAdvertisingOptOutNotice: number;
  SaleOptOut: number;
  TargetedAdvertisingOptOut: number;
  SensitiveDataProcessing: number[];
  KnownChildSensitiveDataConsents: number;
  MspaCoveredTransaction: number;
  MspaOptOutOptionMode: number;
  MspaServiceProviderMode: number;
};

type Section = Array<CoreSubsection>;

const SectionID = 11;
const APIPrefix = "usut";

export type { Section };

export { SectionID, APIPrefix };
