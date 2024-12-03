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

const windowStorageProxy = new Proxy(window, {
  get: (target, prop, receiver) => {
    if (!consent.deviceAccess) {
      return undefined;
    }
    return Reflect.get(target, prop, receiver);
  },

  set: (target, prop, value, receiver) => {
    if (!consent.deviceAccess) {
      return false;
    }
    return Reflect.set(target, prop, value, receiver);
  },
});

export { localStorageProxy as localStorage, windowStorageProxy as window };
