import OptableSDK from "../sdk";

declare module "../sdk" {
    export interface OptableSDK {
        tryTopicsAPI: () => void;
        getTopics: () => Promise<void>;
    }
}

  const chromeDocument = document as Document & {
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
  };

OptableSDK.prototype.tryTopicsAPI = async function () {
    if (!sessionStorage.topics_fetched && 'browsingTopics' in chromeDocument) {
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
