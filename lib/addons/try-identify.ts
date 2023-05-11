import OptableSDK from "../sdk";

declare module "../sdk" {
  export interface OptableSDK {
    tryIdentifyFromParams: () => void;
  }
}

const eidRegexp = /^[a-f0-9]{64}$/i;
function maybeValidEID(eid: string): boolean {
  return eidRegexp.test(eid);
}

OptableSDK.prototype.tryIdentifyFromParams = function (key?: string) {
  const keyRegexp = new RegExp(`^${key || "oeid"}$`, "i");
  const searchParams = new URLSearchParams(window.location.search);
  let eid = "";
  for (const [key, value] of searchParams) {
    if (keyRegexp.test(key)) {
      eid = value
      break;
    }
  }

  if (!maybeValidEID(eid)) {
    return
  }


  this.identify("e:" + eid.toLowerCase());
};
