import { consoleLog, debugLog, optableMessage } from "./log";
import { resetFlags } from "./flags";

beforeEach(() => {
  sessionStorage.clear();
  resetFlags();
});

describe("debugLog", () => {
  it("is silent when optableDebug is not set", () => {
    const spy = jest.spyOn(console, "log").mockImplementation(() => {});
    debugLog("log", "hello");
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it("logs with the Optable prefix when optableDebug is set", () => {
    sessionStorage.setItem("optableDebug", "1");
    resetFlags();

    const spy = jest.spyOn(console, "info").mockImplementation(() => {});
    debugLog("info", "hello", { detail: 1 });
    expect(spy).toHaveBeenCalledWith("Optable: hello", { detail: 1 });
    spy.mockRestore();
  });

  it("stays silent when optableDebug is explicitly disabled", () => {
    sessionStorage.setItem("optableDebug", "0");
    resetFlags();

    const spy = jest.spyOn(console, "log").mockImplementation(() => {});
    debugLog("log", "hello");
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it("falls back to console.log for unknown levels", () => {
    sessionStorage.setItem("optableDebug", "1");
    resetFlags();

    const spy = jest.spyOn(console, "log").mockImplementation(() => {});
    debugLog("verbose", "hello");
    expect(spy).toHaveBeenCalledWith("Optable: hello");
    spy.mockRestore();
  });
});

describe("optableMessage", () => {
  it("is silent when optableDebug is not set", () => {
    const spy = jest.spyOn(console, "log").mockImplementation(() => {});
    optableMessage("hello");
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it("logs with the wrapper prefix and passes arguments through", () => {
    sessionStorage.setItem("optableDebug", "1");
    resetFlags();

    const spy = jest.spyOn(console, "log").mockImplementation(() => {});
    optableMessage("hello", { detail: 1 });
    expect(spy).toHaveBeenCalledWith("[OPTABLE WRAPPER]", "hello", { detail: 1 });
    spy.mockRestore();
  });

  it("stays silent when optableDebug is explicitly disabled", () => {
    sessionStorage.setItem("optableDebug", "0");
    resetFlags();

    const spy = jest.spyOn(console, "log").mockImplementation(() => {});
    optableMessage("hello");
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});

describe("consoleLog", () => {
  it("writes unconditionally with the given prefix", () => {
    const spy = jest.spyOn(console, "warn").mockImplementation(() => {});
    consoleLog("Optable RTD:", "warn", "careful");
    expect(spy).toHaveBeenCalledWith("Optable RTD: careful");
    spy.mockRestore();
  });
});
