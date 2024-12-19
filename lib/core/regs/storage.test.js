import { LocalStorageProxy } from "./storage";

describe("LocalStorageProxy", () => {
  let windowSpy;

  let localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  };

  beforeEach(() => {
    windowSpy = jest.spyOn(window, "window", "get");
    windowSpy.mockImplementation(() => ({
      localStorage: localStorageMock,
    }));
  });

  afterEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    windowSpy.mockRestore();
  });

  it("proxies to underlying storage when consent granted", () => {
    const storage = new LocalStorageProxy({ deviceAccess: true });

    storage.getItem("key");
    expect(localStorageMock.getItem).toHaveBeenCalledWith("key");

    storage.setItem("key", "value");
    expect(localStorageMock.setItem).toHaveBeenCalledWith("key", "value");

    storage.removeItem("key");
    expect(localStorageMock.removeItem).toHaveBeenCalledWith("key");
  });

  it("doesn't access underlying storage when consent not granted", () => {
    const storage = new LocalStorageProxy({ deviceAccess: false });

    const result = storage.getItem("key");
    expect(localStorageMock.getItem).not.toHaveBeenCalled();
    expect(result).toBeNull();

    storage.setItem("key", "value");
    expect(localStorageMock.setItem).not.toHaveBeenCalled();

    storage.removeItem("key");
    expect(localStorageMock.removeItem).not.toHaveBeenCalled();
  });
});
