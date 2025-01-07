type CoreSubsection = {
  Version: number;
  ProcessingNotice: number;
  SaleOptOutNotice: number;
  TargetedAdvertisingOptOutNotice: number;
  SaleOptOut: number;
  TargetedAdvertisingOptOut: number;
  SensitiveDataProcessing: number[];
  KnownChildSensitiveDataConsents: number;
  AdditionalDataProcessingConsent: number;
  MspaCoveredTransaction: number;
  MspaOptOutOptionMode: number;
  MspaServiceProviderMode: number;
};

type Section = Array<CoreSubsection>;

const SectionID = 15;
const APIPrefix = "usor";

export type { Section };

export { SectionID, APIPrefix };
