import OptableSDK from "../sdk";
interface BrowsingTopic {
  configVersion: string;
  modelVersion: string;
  taxonomyVersion: string;
  topic: number;
  version: string;
}

declare module "../sdk" {
  export interface OptableSDK {
    getTopics: () => Promise<BrowsingTopic[]>;
    ingestTopics: () => void;
  }
}

/*
 * getTopics injects an iframe into the page that obtains the browsingTopics observed by optable.
 */
OptableSDK.prototype.getTopics = async function (): Promise<BrowsingTopic[]> {
  const supported = "browsingTopics" in document;
  if (!supported) {
    throw "browsing-topics not supported";
  }

  if (!this.dcn.consent.deviceAccess) {
    throw "consent not granted for reading browsing topics";
  }

  await this.init;
  let siteConfig = this.siteFromCache();
  if (!siteConfig) {
    siteConfig = await this.site();
  }

  if (!siteConfig.getTopicsURL) {
    throw "origin not enabled for topics api";
  }
  const getTopicsURL = new URL(siteConfig.getTopicsURL);
  const topicsFrame = document.createElement("iframe");
  topicsFrame.src = getTopicsURL.toString();
  topicsFrame.allow = "browsing-topics " + getTopicsURL.origin;
  topicsFrame.style.display = "none";

  const topicsPromise = new Promise<BrowsingTopic[]>((resolve, reject) => {
    window.addEventListener("message", (event: MessageEvent<{ error?: Error | string; result: BrowsingTopic[] }>) => {
      if (event.source !== topicsFrame.contentWindow) {
        return;
      }

      if (event.data.error) {
        reject(new Error(event.data.error.toString()));
        return;
      }

      resolve(event.data.result);
    });
  });

  document.body.appendChild(topicsFrame);
  return topicsPromise;
};

/*
 * ingestTopics invokes getTopics then makes a profile() call with the resulting topics, if any.
 */
OptableSDK.prototype.ingestTopics = function () {
  this.getTopics()
    .then((topics) => {
      if (!topics.length) {
        return;
      }

      const traits = topics.reduce((acc, topic) => {
        const traitKey = `topics_v${topic.taxonomyVersion}`;
        if (acc[traitKey]) {
          acc[traitKey] += ",";
        } else {
          acc[traitKey] = "";
        }
        acc[traitKey] += String(topic.topic);
        return acc;
      }, {} as Record<string, string>);

      this.profile(traits);
    })
    .catch(() => {});
};
