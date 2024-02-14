import OptableSDK from "../sdk";

declare module "../sdk" {
    export interface OptableSDK {
        ingestTopics: () => void;
    }
}

OptableSDK.prototype.ingestTopics = async function (): Promise<void> {
    const topics = await optable.instance.getTopics().catch(() => {});
    if (topics && topics.length > 0) {
        this.profile({
            topics_api: topics.join('|')
        });
    }
    return;
}
