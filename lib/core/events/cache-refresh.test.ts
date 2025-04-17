import { sendTargetingCacheRefreshEvent } from "./cache-refresh";
import { ResolvedConfig } from "../../config";
import { TargetingResponse } from "../../edge/targeting";

const mock_configs: ResolvedConfig = {
    sessionID: "session-id",
    host: "host.com",
    site: "my-site",
    node: "my-node",
    cookies: true,
    initPassport: true,
    readOnly: false,
    experiments: [],
    consent: {
        reg: null,
        deviceAccess: true,
        createProfilesForAdvertising: true,
        useProfilesForAdvertising: true,
        measureAdvertisingPerformance: true,
    },
};

const mock_response: TargetingResponse = {
    ortb2: {
        user: {
            eids: [
                { matcher: "matcher-a", source: "source-a", uids: [{ id: "id-a" }] },
                { matcher: "matcher-b", source: "source-b", uids: [{ id: "id-b" }] },
                { matcher: "matcher-b", source: "source-c", uids: [{ id: "id-c" }] },
            ]
        }
    }
};


describe("sendTargetingCacheRefreshEvent", () => {
    it("should dispatch 'optable_cache_refresh' event with correct details", async () => {
        const eventPromise = new Promise<CustomEvent>((resolve) => {
            window.addEventListener("optable_cache_refresh", (event) => {
                resolve(event as CustomEvent);
            });
        });

        await sendTargetingCacheRefreshEvent(mock_configs, mock_response);

        const event = await eventPromise;

        expect(event.detail.instance).toBe("my-node");
        expect(event.detail.resolved).toBe(true);
        expect(event.detail.ortb2).toEqual(mock_response.ortb2);
        expect([...event.detail.provenance]).toEqual(["matcher-a", "matcher-b"]);
    });

    it("falls back to host when no node present", async () => {
        mock_configs.node = "";

        const eventPromise = new Promise<CustomEvent>((resolve) => {
            window.addEventListener("optable_cache_refresh", (event) => {
                resolve(event as CustomEvent);
            });
        });

        await sendTargetingCacheRefreshEvent(mock_configs, mock_response);

        const event = await eventPromise;

        expect(event.detail.instance).toBe("host.com"); // node if available
    });

    it("resolved to false when no eids", async () => {
        mock_response.ortb2.user = {};

        const eventPromise = new Promise<CustomEvent>((resolve) => {
            window.addEventListener("optable_cache_refresh", (event) => {
                resolve(event as CustomEvent);
            });
        });

        await sendTargetingCacheRefreshEvent(mock_configs, mock_response);

        const event = await eventPromise;

        expect(event.detail.resolved).toBe(false); // false if no eids
    });

});
