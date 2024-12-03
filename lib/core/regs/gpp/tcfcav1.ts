import { ArrayOfRanges } from "./primitives";

type CoreSubsection = {
  Version: number;
  Created: Date;
  LastUpdated: Date;
  CmpId: number;
  CmpVersion: number;
  ConsentScreen: number;
  ConsentLanguage: string;
  VendorListVersion: number;
  TcfPolicyVersion: number;
  UseNonStandardStacks: boolean;
  SpecialFeatureExpressConsent: number[];
  PurposesExpressConsent: number[];
  PurposesImpliedConsent: number[];
  VendorExpressConsent: number[];
  VendorImpliedConsent: number[];
  PubRestrictions: ArrayOfRanges;
};

type DisclosedVendorsSubsection = {
  SubsectionType: 1;
  DisclosedVendors: number[];
};

type PublisherPurposesSubsection = {
  SubsectionType: 3;
  PubPurposesExpressConsent: number[];
  PubPurposesImpliedConsent: number[];
  NumCustomPurposes: number;
  CustomPurposesExpressConsent: number[];
  CustomPurposesImpliedConsent: number[];
};

const SectionID = 5;
const APIPrefix = "tcfcav1";

type Section = Array<CoreSubsection | DisclosedVendorsSubsection | PublisherPurposesSubsection>;

export type { Section };

export { APIPrefix, SectionID };
