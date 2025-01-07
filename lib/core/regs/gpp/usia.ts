type CoreSubsection = {
  Version: number;
  ProcessingNotice: number;
  SaleOptOutNotice: number;
  TargetedAdvertisingOptOutNotice: number;
  SensitiveDataOptOutNotice: number;
  SaleOptOut: number;
  TargetedAdvertisingOptOut: number;
  SensitiveDataProcessing: number[];
  KnownChildSensitiveDataConsents: number;
  MspaCoveredTransaction: number;
  MspaOptOutOptionMode: number;
  MspaServiceProviderMode: number;
};

type Section = Array<CoreSubsection>;

const SectionID = 18;
const APIPrefix = "usia";

export type { Section };

export { SectionID, APIPrefix };
