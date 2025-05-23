import OptableSDK from "../sdk";
import { AuctionConfig, Size } from "../edge/site";

declare global {
  interface Navigator {
    runAdAuction: (config: AuctionConfig) => Promise<any>;
  }
}

type GPTSlotFilter = (slot: googletag.Slot) => boolean;

type RunAdAuctionOptions = {
  iframe?: boolean;
};

declare module "../sdk" {
  export interface OptableSDK {
    joinAdInterestGroups: () => Promise<void>;
    auctionConfig: () => Promise<AuctionConfig | null>;
    runAdAuction: (domID: string, options?: RunAdAuctionOptions) => Promise<boolean>;
    installGPTAuctionConfigs: (filter?: GPTSlotFilter) => Promise<void>;
  }
}

interface HTMLFencedFrameElement extends HTMLElement {
  config: any;
}

/*
 * auctionConfig obtains the auction configuration for the current origin
 */
OptableSDK.prototype.auctionConfig = async function (): Promise<AuctionConfig | null> {
  await this.init;
  let siteConfig = this.siteFromCache();
  if (!siteConfig) {
    siteConfig = await this.site();
  }

  return siteConfig.auctionConfig ?? null;
};

function elementInnerSize(element: HTMLElement): Size {
  const style = window.getComputedStyle(element, null);
  return {
    width: style.getPropertyValue("width"),
    height: style.getPropertyValue("height"),
  };
}

/*
 * installGPTAuctionConfigs obtains the auction configuration for the current origin
 * and installs it into the page GPT slots, optionally filtered.
 */

OptableSDK.prototype.installGPTAuctionConfigs = async function (filter?: GPTSlotFilter) {
  const sdk = this;
  sdk.installGPTAuctionConfigs = function () {
    return Promise.resolve();
  };

  const siteAuctionConfig = await sdk.auctionConfig();
  if (!siteAuctionConfig) {
    return;
  }

  window.googletag = window.googletag || { cmd: [] };
  const gpt = window.googletag;

  gpt.cmd.push(function () {
    let slots = gpt.pubads().getSlots();
    if (filter) {
      slots = slots.filter(filter);
    }

    for (const slot of slots) {
      const sizes = slot.getSizes();
      const componentAuction = [];

      for (const size of sizes) {
        if (size === "fluid") {
          continue;
        }

        componentAuction.push({
          configKey: siteAuctionConfig.seller + "-" + size.getWidth() + "x" + size.getHeight(),
          auctionConfig: {
            ...siteAuctionConfig,
            requestedSize: { width: size.getWidth() + "px", height: size.getHeight() + "px" },
          },
        });
      }

      // @ts-ignore // outdated typings for componentAuction expects some legacy field names
      slot.setConfig({ componentAuction });
    }
  });
};

/*
 * runAdAuction runs an ad auction locally for a given spot dom ID.
 */
OptableSDK.prototype.runAdAuction = async function (domID: string, options?: RunAdAuctionOptions): Promise<boolean> {
  const supported = "runAdAuction" in navigator;
  if (!supported) {
    throw "run-ad-auction not supported";
  }

  const spot = document.getElementById(domID);
  if (!spot) {
    throw "spot not found";
  }
  const requestedSize = elementInnerSize(spot);

  const siteAuctionConfig = await this.auctionConfig();
  if (!siteAuctionConfig) {
    return false;
  }

  const auctionConfig = {
    ...siteAuctionConfig,
    requestedSize,
    resolveToConfig: true,
  };

  const useIframe = options?.iframe ?? false;

  if (useIframe) {
    auctionConfig.resolveToConfig = false;
  }

  const result = await navigator.runAdAuction(auctionConfig);
  if (!result) {
    spot.replaceChildren();
    return false;
  }

  if (useIframe) {
    const iframe = document.createElement("iframe");
    iframe.src = result;
    iframe.style.border = "none";
    iframe.style.width = requestedSize.width;
    iframe.style.height = requestedSize.height;
    spot.replaceChildren(iframe);
  } else {
    const fencedFrame = document.createElement("fencedframe") as HTMLFencedFrameElement;
    fencedFrame.config = result;
    fencedFrame.style.border = "none";
    spot.replaceChildren(fencedFrame);
  }

  return true;
};

/*
 * joinAdInterestGroups injects an iframe into the page that tags the device into the matching audiences interest group.
 */
OptableSDK.prototype.joinAdInterestGroups = async function () {
  const supported = "joinAdInterestGroup" in navigator;
  if (!supported) {
    throw "join-ad-interest-group not supported";
  }

  // For now gate for everything happenning inside the join-ig frame.
  // Eventually each behavior will be individually gated in the frame itself.
  const accessGranted =
    this.dcn.consent.deviceAccess &&
    this.dcn.consent.createProfilesForAdvertising &&
    this.dcn.consent.measureAdvertisingPerformance;

  if (!accessGranted) {
    throw "consent not granted for joining interest groups";
  }

  await this.init;
  let siteConfig = this.siteFromCache();
  if (!siteConfig) {
    siteConfig = await this.site();
  }

  if (!siteConfig.interestGroupPixel) {
    throw "origin not enabled for protected audience apis";
  }
  const pixelURL = new URL(siteConfig.interestGroupPixel);
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
};
