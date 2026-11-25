const instance_config = { host: "localhost", site: "test", initPassport: false };

function loadBundle() {
  jest.isolateModules(() => {
    require("./sdk");
  });
}

describe("browser bundle", () => {
  afterEach(() => {
    delete window.optable;
  });

  it("creates the instance from instance_config before draining queued commands", () => {
    let seen: unknown;
    window.optable = {
      cmd: [() => (seen = window.optable!.instance)],
      instance_config,
    };

    loadBundle();

    expect(window.optable.instance).toBeDefined();
    expect(seen).toBe(window.optable.instance);
    expect(window.optable.utils).toBeDefined();
  });

  it("completes setup when a queued command throws", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    const after = jest.fn();
    window.optable = {
      cmd: [
        () => {
          throw new Error("boom");
        },
        after,
      ],
      instance_config,
    };

    loadBundle();

    expect(after).toHaveBeenCalledTimes(1);
    expect(window.optable.instance).toBeDefined();
    expect(window.optable.utils).toBeDefined();

    const pushed = jest.fn();
    window.optable.cmd!.push(pushed);
    expect(pushed).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });
});
