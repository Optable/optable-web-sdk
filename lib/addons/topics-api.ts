import OptableSDK from "../sdk";

interface Document {
    browsingTopics?: () => Promise<any[]>;
}

declare module "../sdk" {
    export interface OptableSDK {
        tryTopicsAPI: () => void;
        getTopics: () => Promise<void>;
    }
}

OptableSDK.prototype.tryTopicsAPI = async function () {
    if (!sessionStorage.topics_fetched && document && typeof document.browsingTopics == 'function') {
        const topicsArray = await document.browsingTopics();
        if (topicsArray.length > 0) {
            const topics: string[] = [];
            for (let topic of topicsArray) {
                topics.push('taxonomy version: ' + topic.taxonomyVersion + ', topic id: ' + topic.topic);
            }

            if (topics.length > 0) {
                this.profile({
                    topics_api: topics.join('|')
                });
            }
        }

        return;
    }
    sessionStorage.topics_fetched = true;
}
