import consent from "./consent";

const localStorageProxy = {
  getItem: (key: string): string | null => {
    if (!consent.deviceAccess) {
      return null;
    }

    return window.localStorage.getItem(key);
  },

  setItem: (key: string, value: string): void => {
    if (!consent.deviceAccess) {
      return;
    }

    window.localStorage.setItem(key, value);
  },

  removeItem: (key: string): void => {
    if (!consent.deviceAccess) {
      return;
    }

    window.localStorage.removeItem(key);
  },
};

export { localStorageProxy as localStorage };
