import { OptableCommands } from "./commands";

describe("OptableCommands", () => {
  it("executes functions queued before construction, in order", () => {
    const calls: number[] = [];
    new OptableCommands([() => calls.push(1), () => calls.push(2)]);
    expect(calls).toEqual([1, 2]);
  });

  it("ignores non-function entries in the queue", () => {
    const fn = jest.fn();
    expect(() => new OptableCommands([null, "x", 42, fn])).not.toThrow();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("logs a throwing queued function and continues draining", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    const after = jest.fn();
    const boom = new Error("boom");
    expect(
      () =>
        new OptableCommands([
          () => {
            throw boom;
          },
          after,
        ])
    ).not.toThrow();
    expect(after).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(boom);
    spy.mockRestore();
  });

  it("tolerates a missing or non-array queue", () => {
    expect(() => new OptableCommands()).not.toThrow();
    expect(() => new OptableCommands(undefined)).not.toThrow();
    expect(() => new OptableCommands({} as unknown)).not.toThrow();
  });

  it("executes pushed functions immediately and returns their value", () => {
    const cmd = new OptableCommands([]);
    const fn = jest.fn(() => "done");
    expect(cmd.push(fn)).toBe("done");
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
