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

  removeItem(key: string): void {
    if (!this.consent.deviceAccess) {
      return;
    }

    window.localStorage.removeItem(key);
  }
}

export { LocalStorageProxy };
