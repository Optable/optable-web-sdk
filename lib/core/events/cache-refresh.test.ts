import { sendTargetingUpdateEvent } from "./cache-refresh";
import { ResolvedConfig } from "../../config";
import { TargetingResponse } from "../../edge/targeting";

const mock_configs = {
  host: "host.com",
  node: "my-node",
} as ResolvedConfig;

const mock_response: TargetingResponse = {
  resolved_id: "resolved-id",
  ortb2: {
    user: {
      eids: [
        { matcher: "matcher-a", source: "source-a", uids: [{ id: "id-a" }] },
        { matcher: "matcher-b", source: "source-b", uids: [{ id: "id-b" }] },
        { matcher: "matcher-b", source: "source-c", uids: [{ id: "id-c" }] },
      ],
    },
  },
};

describe("sendTargetingUpdateEvent", () => {
  it("should dispatch 'optable-targeting:change' event with correct details", async () => {
    const eventPromise = new Promise<CustomEvent>((resolve) => {
      window.addEventListener("optable-targeting:change", (event) => {
        resolve(event as CustomEvent);
      });
    });

    sendTargetingUpdateEvent(mock_configs, mock_response);

    const event = await eventPromise;

    expect(event.detail.instance).toBe("my-node");
    expect(event.detail.resolved).toBe(true);
    expect(event.detail.resolvedID).toBe("resolved-id");
    expect(event.detail.ortb2).toEqual(mock_response.ortb2);
    expect([...event.detail.provenance]).toEqual(["matcher-a", "matcher-b"]);
  });

  it("falls back to host when no node present", async () => {
    mock_configs.node = "";

    const eventPromise = new Promise<CustomEvent>((resolve) => {
      window.addEventListener("optable-targeting:change", (event) => {
        resolve(event as CustomEvent);
      });
    });

    sendTargetingUpdateEvent(mock_configs, mock_response);

    const event = await eventPromise;

    expect(event.detail.instance).toBe("host.com"); // node if available
  });

  it("resolved to false when no eids", async () => {
    mock_response.ortb2.user = {};

    const eventPromise = new Promise<CustomEvent>((resolve) => {
      window.addEventListener("optable-targeting:change", (event) => {
        resolve(event as CustomEvent);
      });
    });

    sendTargetingUpdateEvent(mock_configs, mock_response);

    const event = await eventPromise;

    expect(event.detail.resolved).toBe(false); // false if no eids
  });

  it("doesnt expose resolvedID when absent ", async () => {
    mock_response.ortb2.user = {};

    const eventPromise = new Promise<CustomEvent>((resolve) => {
      window.addEventListener("optable-targeting:change", (event) => {
        resolve(event as CustomEvent);
      });
    });

    const { resolved_id: _ignore, ...response } = mock_response;

    sendTargetingUpdateEvent(mock_configs, response);

    const event = await eventPromise;

    expect(event.detail.resolvedID).toBeUndefined();
  });
});
