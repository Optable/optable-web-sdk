import { ArrayOfRanges } from "./primitives";

type CoreSegment = {
  Version: number;
  Created: Date;
  LastUpdated: Date;
  CmpId: number;
  CmpVersion: number;
  ConsentScreen: number;
  ConsentLanguage: string;
  VendorListVersion: number;
  TcfPolicyVersion: number;
  IsServiceSpecific: boolean;
  UseNonStandardTexts: boolean;
  SpecialFeatureOptIns: number[];
  PurposeConsent: number[];
  PurposesLITransparency: number[];
  PurposeOneTreatment: boolean;
  PublisherCC: string;
  VendorConsent: number[];
  VendorLegitimateInterest: number[];
  PubRestrictions: ArrayOfRanges;
};

type DisclosedVendorsSegment = {
  SegmentType: 1;
  DisclosedVendors: number[];
};

type PublisherPurposesSegment = {
  SegmentType: 3;
  PubPurposesConsent: number[];
  PubPurposesLITransparency: number[];
  NumCustomPurposes: number;
  CustomPurposesConsent: number[];
  CustomPurposesLITransparency: number[];
};

const SectionID = 2;
const APIPrefix = "tcfeuv2";

type Section = Array<CoreSegment | DisclosedVendorsSegment | PublisherPurposesSegment>;

export type { Section };

export { APIPrefix, SectionID };
