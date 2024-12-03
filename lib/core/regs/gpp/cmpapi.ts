import { Section as TCFCaV1Section, APIPrefix as TCFCaV1APIPrefix } from "./tcfcav1";
import { Section as TCFEuV2Section, APIPrefix as TCFEuV2APIPrefix } from "./tcfeuv2";

declare global {
  interface Window {
    __gpp?(command: "addEventListener", cb: AddEventListenerCallback): void;
  }
}

type ParsedSections = {
  [TCFEuV2APIPrefix]?: TCFEuV2Section;
  [TCFCaV1APIPrefix]?: TCFCaV1Section;
};

type PingReturn = {
  gppVersion: string;
  cmpStatus: "stub" | "loading" | "loaded" | "error";
  cmpDisplayStatus: "hidden" | "visible" | "disabled";
  signalStatus: "not ready" | "ready";
  supportedAPIs: string[];
  cmpId: number;
  sectionList: number[];
  applicableSections: number[];
  gppString: string;
  parsedSections: ParsedSections;
};

type AddEventListener = {
  eventName: string;
  listenerId: number;
  data: any;
  pingData: PingReturn;
};

type AddEventListenerCallback = (data: AddEventListener, success: boolean) => void;

export { PingReturn };
