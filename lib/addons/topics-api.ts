import OptableSDK from "../sdk";

declare module "../sdk" {
    export interface OptableSDK {
        getTopics: () => void;
    }
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
        featurePolicy?: { allowsFeature: (feature: string) => boolean };
    }
}

OptableSDK.prototype.getTopics = async function () {
    if (!sessionStorage.topics_fetched &&
        typeof document.browsingTopics === 'function' &&
        typeof document.featurePolicy === 'object' &&
        document.featurePolicy.allowsFeature('browsing-topics')) {
        const topics = (await document.browsingTopics()).map(topic => `taxonomy version ${topic.taxonomyVersion}, topic ${topic.topic}`);
        if (topics.length > 0) {
            this.profile({
                topics_api: topics.join('|')
            });
        }
    }

    sessionStorage.topics_fetched = true;
    return;
}
