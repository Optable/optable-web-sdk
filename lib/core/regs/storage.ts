import { Consent } from "./consent";

class LocalStorageProxy {
  private consent: Consent;
  constructor(consent: Consent) {
    this.consent = consent;
  }

  getItem(key: string): string | null {
    if (!this.consent.deviceAccess) {
      return null;
    }

    return window.localStorage.getItem(key);
  }

  setItem(key: string, value: string): void {
    if (!this.consent.deviceAccess) {
      return;
    }

    window.localStorage.setItem(key, value);
  }

  // Removal is deliberately not gated on consent. deviceAccess governs reading
  // and writing; refusing to delete leaves data on the device in precisely the
  // state where the user has withdrawn permission for us to keep it. Gating it
  // also makes clearTargeting(), clearPassport(), clearSite() and the public
  // sdk.targetingClearCache() silent no-ops for the one caller that needs them
  // most: a publisher clearing our storage on opt-out.
  removeItem(key: string): void {
    window.localStorage.removeItem(key);
  }
}

export { LocalStorageProxy };
