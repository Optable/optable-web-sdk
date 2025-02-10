declare global {
  interface Window {
    __tcfapi?(command: "addEventListener", version: number, cb: AddEventListenerCallback): void;
  }
}

type TCData = {
  tcString: string;
  tcfPolicyVersion: number;
  cmpId: number;
  cmpVersion: number;
  gdprApplies?: boolean;
  eventStatus: "tcloaded" | "cmpuishown" | "useractioncomplete";
  cmpStatus: "stub" | "loading" | "loaded" | "error";
  listenerId?: number;
  isServiceSpecific: boolean;
  useNonStandardStacks: boolean;
  publisherCC: string;
  purposeOneTreatment: boolean;
  purpose?: {
    consents?: {
      [purposeID: string]: boolean;
    };
    legitimateInterests?: {
      [purposeID: string]: boolean;
    };
  };
  vendor?: {
    consents?: {
      [vendorID: string]: boolean;
    };
    legitimateInterests?: {
      [vendorID: string]: boolean;
    };
  };
  specialFeatureOptins: {
    [featureID: string]: boolean;
  };
  publisher?: {
    consents?: {
      [purposeID: string]: boolean;
    };
    legitimateInterests?: {
      [purposeID: string]: boolean;
    };
    customPurpose?: {
      consents?: {
        [purposeID: string]: boolean;
      };
      legitimateInterests?: {
        [purposeID: string]: boolean;
      };
    };
    restrictions?: {
      [purposeID: string]: {
        [vendorID: string]: 0 | 1 | 2;
      };
    };
  };
};

type AddEventListenerCallback = (data: TCData, success: boolean) => void;

export { TCData };
