// Command queue for async script-tag wrappers, in the style of googletag.cmd
// and pbjs.que. Pages push functions onto a plain-array stub before the
// wrapper script loads; the wrapper replaces the stub with an instance, which
// drains the queue and executes later pushes immediately.
class OptableCommands {
  constructor(cmds?: unknown) {
    if (Array.isArray(cmds)) {
      cmds.forEach((cmd) => {
        if (typeof cmd === "function") cmd();
      });
    }
  }

  push(cmd: () => unknown): unknown {
    return cmd();
  }
}

export { OptableCommands };
export default OptableCommands;
