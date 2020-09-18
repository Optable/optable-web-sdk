class Commands {
  constructor(private cmds: Commands | Function[]) {
    if (Array.isArray(this.cmds)) {
      for (const cmd of this.cmds) {
        if (typeof cmd === "function") cmd();
      }
    }
  }

  push(cmd: Function) {
    cmd();
  }
}

export { Commands };
export default Commands;
