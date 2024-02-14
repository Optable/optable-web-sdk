import OptableSDK from "../sdk";
interface BrowsingTopic {
  configVersion: string;
  modelVersion: string;
  taxonomyVersion: string;
  topic: number;
  version: string;
}

/*
 * getTopics injects an iframe into the page that obtains the browsingTopics observed by optable.
 */
OptableSDK.prototype.getTopics = async function(): Promise<BrowsingTopic[]> {
  const siteConfig = await this.site();
  if (!siteConfig.getTopicsURL) {
    throw ("origin not enabled for topics api");
  }
  const getTopicsURL = new URL(siteConfig.getTopicsURL);
  const topicsFrame = document.createElement("iframe");
  topicsFrame.src = getTopicsURL.toString()
  topicsFrame.allow = "browsing-topics " + getTopicsURL.origin;
  topicsFrame.style.display = "none";

  const topicsPromise = new Promise<BrowsingTopic[]>((resolve, reject) => {
    window.addEventListener("message", (event: MessageEvent<{ error?: Error, result: BrowsingTopic[] }>) => {
      if (event.source !== topicsFrame.contentWindow) {
        return
      }

      if (event.data.error) {
        reject(event.data.error)
        return
      }

      resolve(event.data.result)
    })
  })

  document.body.appendChild(topicsFrame);
  return topicsPromise;
}

/*
 * ingestTopics invokes getTopics then makes a profile() call with the resulting topics, if any.
 */
OptableSDK.prototype.ingestTopics = async function (): Promise<void> {
    const topics = await optable.instance.getTopics().catch(() => {});
    if (topics && topics.length > 0) {
        this.profile({
            topics_api: topics.join('|')
        });
    }
    return;
}
