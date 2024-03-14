import OptableSDK from "../sdk";

interface Size {
  width: string;
  height: string;
}

interface AuctionConfig {
  seller: string;
  decisionLogicURL: string;
  requestedSize?: Size;
  interestGroupBuyers: string[];
  resolveToConfig?: boolean;
  auctionSignals?: any;
}

declare global {
  interface Navigator {
    runAdAuction: (config: AuctionConfig) => Promise<any>;
  }
}

type GPTSlotFilter = (slot: googletag.Slot) => boolean;

declare module "../sdk" {
  export interface OptableSDK {
    joinAdInterestGroups: () => Promise<void>;
    auctionConfig: () => Promise<AuctionConfig>;
    runAdAuction: (domID: string) => Promise<unknown>;
    installGPTAuctionConfigs: (filter?: GPTSlotFilter) => Promise<void>;
  }
}

interface HTMLFencedFrameElement extends HTMLElement {
  config: any;
}

/*
 * auctionConfig obtains the auction configuration for the current origin
 */
OptableSDK.prototype.auctionConfig = async function(): Promise<AuctionConfig> {
  const siteConfig = await this.site();
  const res = await fetch(siteConfig.auctionConfigURL)
  const auctionConfig = await res.json()
  return auctionConfig
}

function elementInnerSize(element: HTMLElement): Size {
  const style = window.getComputedStyle(element, null);
  return {
    width: style.getPropertyValue('width'),
    height: style.getPropertyValue('height'),
  };
}

/*
 * installGPTAuctionConfigs obtains the auction configuration for the current origin
 * and installs it into the page GPT slots, optionally filtered.
 */

OptableSDK.prototype.installGPTAuctionConfigs = async function(filter?: GPTSlotFilter): Promise<void> {
  if (!window.googletag) {
    throw ("googletag not found");
  }
  let slots = window.googletag.pubads().getSlots()
  if (filter) {
    slots = slots.filter(filter)
  }

  const auctionConfig = await this.auctionConfig();

  for (const slot of slots) {
    const sizes = slot.getSizes();
    const componentAuction = []

    for (const size of sizes) {
      if (size === "fluid") {
        continue
      }

      componentAuction.push({
        configKey: auctionConfig.seller + "-" + size.getWidth() + "x" + size.getHeight(),
        auctionConfig: {
          ...auctionConfig,
          requestedSize: { width: size.getWidth() + "px", height: size.getHeight() + "px" },
        },
      })
    }

    // @ts-ignore // outdated typings for componentAuction expects some legacy field names
    slot.setConfig({ componentAuction })
  }
}

/*
 * runAdAuction runs an ad auction locally for a given spot dom ID.
 */
OptableSDK.prototype.runAdAuction = async function(domID: string): Promise<void> {
  const spot = document.getElementById(domID);
  if (!spot) {
    throw ("spot not found");
  }
  const requestedSize = elementInnerSize(spot);
  const auctionConfig = {
    ...(await this.auctionConfig()),
    requestedSize,
    resolveToConfig: true,
  };
  const fencedFrameConfig = await navigator.runAdAuction(auctionConfig)
  if (!fencedFrameConfig) {
    spot.replaceChildren();
    return
  }

  const fencedFrame = document.createElement("fencedframe") as HTMLFencedFrameElement;
  fencedFrame.config = fencedFrameConfig;
  fencedFrame.style.border = "none";
  spot.replaceChildren(fencedFrame);
}

/*
 * joinAdInterestGroups injects an iframe into the page that tags the device into the matching audiences interest group.
 */
OptableSDK.prototype.joinAdInterestGroups = async function() {
  const siteConfig = await this.site();
  if (!siteConfig.interestGroupPixel) {
    throw ("origin not enabled for protected audience apis");
  }
  const pixelURL = new URL(siteConfig.interestGroupPixel);
  const pixel = document.createElement("iframe");
  pixel.src = pixelURL.toString()
  pixel.allow = "join-ad-interest-group " + pixelURL.origin;
  pixel.style.display = "none";

  const joinPromise = new Promise<void>((resolve, reject) => {
    window.addEventListener("message", (event: any) => {
      if (event.source !== pixel.contentWindow) {
        return
      }

      if (event.data.result === "success") {
        resolve()
        return
      }
      reject()
    })
  })

  document.body.appendChild(pixel);
  return joinPromise;
};
