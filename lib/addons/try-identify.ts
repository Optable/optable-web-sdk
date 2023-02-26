import OptableSDK from "../sdk";

declare module "../sdk" {
  export interface OptableSDK {
    tryIdentifyFromParams: () => void;
  }
}

function maybeValidEID(eid: string): boolean {
  return eid.match(/^[a-f0-9]{64}$/i) !== null;
}

OptableSDK.prototype.tryIdentifyFromParams = function (paramKey?: string) {
  const qstr = new URLSearchParams(window.location.search);
  const keys = qstr.keys();
  var eid: string | null = "";

  for (const key of keys) {
    if (key.match(new RegExp('^' + (paramKey || 'oeid') + '$', 'i'))) {
      eid = qstr.get(key);
      break;
    }
  }

  eid = eid || "";
  if (maybeValidEID(eid)) {
    this.identify("e:" + eid.toLowerCase());
  }
};
