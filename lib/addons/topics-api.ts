import OptableSDK from "../sdk";

declare module "../sdk" {
    export interface OptableSDK {
        tryTopicsAPI: () => void;
    }
}

if (!sessionStorage.topics_fetched && document && typeof document.browsingTopics == 'function') {
    (async function getTopics() {
        sessionStorage.topics_fetched = true;
        const topicsArray = await document.browsingTopics();
        if (topicsArray.length > 0) {
            const topics: string[] = [];
            for (let topic of topicsArray) {
                topics.push('taxonomy version: ' + topic.taxonomyVersion + ', topic id: ' + topic.topic);
            }

            if (topics.length > 0) {
                optable.instance.profile({
                    topics_api: topics.join('|')
                });
            }
        }

        return;
    })();
}
