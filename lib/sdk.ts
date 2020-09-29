import type { SandboxConfig } from "./config";
import type { TargetingKeyValues } from "./edge/targeting";
import type { WitnessProperties } from "./edge/witness";
import type { AuthModalDOMConfig, MicroModalConfig } from "./ui/auth_modal";
import Identify from "./edge/identify";
import Targeting from "./edge/targeting";
import Witness from "./edge/witness";
import AuthModal from "./ui/auth_modal";
import { sha256 } from "js-sha256";

class SDK {
  constructor(private sandbox: SandboxConfig) {}

  identify(ids: string[]): Promise<void> {
    return Identify(this.sandbox, ids);
  }

  identifyWithEmail(email: string, ppid?: string): Promise<void> {
    var ids: string[] = [];
    if (email) {
      ids.push(SDK.eid(email));
    }
    if (ppid) {
      ids.push(SDK.cid(ppid));
    }
    return Identify(this.sandbox, ids);
  }

  targeting(): Promise<TargetingKeyValues> {
    return Targeting(this.sandbox);
  }

  witness(event: string, properties: WitnessProperties = {}): Promise<void> {
    return Witness(this.sandbox, event, properties);
  }

  authenticator(DOMConfig?: AuthModalDOMConfig, MicroModalConfig?: MicroModalConfig): AuthModal {
    return new AuthModal(this.sandbox, DOMConfig, MicroModalConfig);
  }

  static eid(email: string): string {
    return "e:" + sha256.hex(email.toLowerCase().trim());
  }

  static cid(ppid: string): string {
    return "c:" + ppid.trim();
  }
}

export { SDK };
export type { SandboxConfig };
export default SDK;
