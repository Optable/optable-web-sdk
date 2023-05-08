import OptableSDK from "../sdk";

declare module "../sdk" {
  export interface OptableSDK {
    setLoblawMediaPrivateID: () => void;
  }
}

const loblawMediaPrivateIDStorageKey = "__loblawmedia_privateid_token";
const loblawMediaUserProvider = "loblawmedia.ca";

/*
 * setLoblawMediaPrivateID() sets up the user's Loblaw Media Private ID from targeting cache in local storage
 * for external consumption by various SDK's (like Prebid.js).
 */
OptableSDK.prototype.setLoblawMediaPrivateID = function () {
  this.targetingFromCache
  const targeting = this.targetingFromCache()
  const result = []
  for (const identifiers of (targeting?.user ?? [])) {
    if (identifiers.provider === loblawMediaUserProvider) {
      result.push(...identifiers.ids.map((item) => item.id))
    }
  }

  window.localStorage.setItem(loblawMediaPrivateIDStorageKey, JSON.stringify(result))
};
