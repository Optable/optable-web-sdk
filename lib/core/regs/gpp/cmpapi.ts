import * as sections from "./sections";

declare global {
  interface Window {
    __gpp?(command: "addEventListener", cb: AddEventListenerCallback): void;
  }
}

type ParsedSections = {
  [sections.tcfcav1.APIPrefix]?: sections.tcfcav1.Section;
  [sections.tcfeuv2.APIPrefix]?: sections.tcfeuv2.Section;
  [sections.usnat.APIPrefix]?: sections.usnat.Section;
  [sections.usca.APIPrefix]?: sections.usca.Section;
  [sections.usco.APIPrefix]?: sections.usco.Section;
  [sections.usct.APIPrefix]?: sections.usct.Section;
  [sections.usde.APIPrefix]?: sections.usde.Section;
  [sections.usfl.APIPrefix]?: sections.usfl.Section;
  [sections.usia.APIPrefix]?: sections.usia.Section;
  [sections.usmt.APIPrefix]?: sections.usmt.Section;
  [sections.usne.APIPrefix]?: sections.usne.Section;
  [sections.usnh.APIPrefix]?: sections.usnh.Section;
  [sections.usnj.APIPrefix]?: sections.usnj.Section;
  [sections.usor.APIPrefix]?: sections.usor.Section;
  [sections.ustn.APIPrefix]?: sections.ustn.Section;
  [sections.ustx.APIPrefix]?: sections.ustx.Section;
  [sections.usut.APIPrefix]?: sections.usut.Section;
  [sections.usva.APIPrefix]?: sections.usva.Section;
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
  parsedSections?: ParsedSections;
};

type AddEventListener = {
  eventName: string;
  listenerId: number;
  data: any;
  pingData: PingReturn;
};

type AddEventListenerCallback = (data: AddEventListener, success: boolean) => void;

export { PingReturn };
