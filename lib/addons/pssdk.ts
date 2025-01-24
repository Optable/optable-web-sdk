import type { Consent } from "../core/regs/consent";
import type { InitConsent } from "../config";
import { resolveConsent } from "../config";

type Config = {
  region: string;
  origin: string;
  consent?: InitConsent;
};

const defaultConfig: Config = {
  region: "ca",
  origin: "https://ads.optable.co",
};

class PrivacySandboxSDK {
  private consent: Consent;
  private config: Config;

  constructor(config?: Config) {
    this.config = { ...defaultConfig, ...config };
    this.consent = resolveConsent(this.config.consent);
  }

  async joinTagInterestGroup(ig: string, traits: Record<string, any> = {}): Promise<void> {
    const supported = "joinAdInterestGroup" in navigator;
    if (!supported) {
      throw "join-ad-interest-group not supported";
    }

    const accessGranted =
      this.consent.deviceAccess &&
      this.consent.createProfilesForAdvertising &&
      this.consent.measureAdvertisingPerformance;

    if (!accessGranted) {
      throw "consent not granted for joining interest groups";
    }

    const pixelURL = new URL(this.config.origin + "/" + this.config.region + "/paapi/v1/dsp/ig/join");
    pixelURL.searchParams.set("ig", ig);

    if (traits && Object.keys(traits).length > 0) {
      const encodedTraits = btoa(JSON.stringify(traits));
      const urlEncodedTraits = encodedTraits.replace(/\+/, "-").replace(/\//, "_");
      pixelURL.searchParams.set("traits", urlEncodedTraits);
    }

    const pixel = document.createElement("iframe");
    pixel.src = pixelURL.toString();
    pixel.allow = "join-ad-interest-group " + pixelURL.origin;
    pixel.style.display = "none";

    const joinPromise = new Promise<void>((resolve, reject) => {
      window.addEventListener("message", (event: any) => {
        if (event.source !== pixel.contentWindow) {
          return;
        }

        if (event.data.result === "success") {
          resolve();
          return;
        }
        reject();
      });
    });

    document.body.appendChild(pixel);
    return joinPromise;
  }

  async registerConversion(id: string): Promise<boolean> {
    const accessGranted = this.consent.deviceAccess && this.consent.measureAdvertisingPerformance;

    if (!accessGranted) {
      throw "consent not granted for registering conversions";
    }

    const fetchURL = new URL(this.config.origin + "/" + this.config.region + "/paapi/v1/dsp/conversion/register");
    fetchURL.searchParams.set("id", id);

    const response = await fetch(fetchURL.toString(), {
      // @ts-ignore this propery is experimental
      attributionReporting: { eventSourceEligible: false, triggerEligible: true },
      keepalive: true,
    });
    return response.ok;
  }
}

export { PrivacySandboxSDK };
export default PrivacySandboxSDK;
