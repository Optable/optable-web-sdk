import SDK from "../sdk";

declare module "../sdk" {
  export interface SDK {
    tryIdentifyFromParams: () => void;
  }
}

function maybeValidEID(eid: string): boolean {
  return eid.match(/^[a-f0-9]{64}$/i) !== null;
}

SDK.prototype.tryIdentifyFromParams = function () {
  const qstr = new URLSearchParams(window.location.search);
  const eid = qstr.get("oeid");
  if (maybeValidEID(eid || "")) {
    this.identify(["e:" + eid]);
  }
};
