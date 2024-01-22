import OptableSDK from "../sdk";

declare module "../sdk" {
    export interface OptableSDK {
        tryTopicsAPI: () => void;
        getTopics: () => Promise<void>;
    }
    
declare global {
    interface Document {    
        browsingTopics?: () => Promise<Array<{
            configVersion: string;
            modelVersion: string;
            taxonomyVersion: string;
            topic: number;
            version: string;
        }>>;
        featurePolicy?: {
            allowsFeature: (feature: string) => boolean;
        };
    }
}

OptableSDK.prototype.tryTopicsAPI = async function () {
    document.browsingTopics
    if (!sessionStorage.topics_fetched && 'browsingTopics' in document) {
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
