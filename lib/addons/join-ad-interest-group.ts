import OptableSDK from "../sdk";

declare module "../sdk" {
  export interface OptableSDK {
    joinAdInterestGroup: () => Promise<void>;
  }
}

/*
 * joinAdInterestGroup injects an iframe into the page that tags the device into the site's interest group.
 */
OptableSDK.prototype.joinAdInterestGroup = async function() {
  const sdk = this;

  const siteConfig = await sdk.site();
  const pixel = document.createElement("iframe");
  if (!siteConfig.interestGroupPixel) {
    throw ("origin not enabled for protected audience apis");
  }
  const pixelURL = new URL(siteConfig.interestGroupPixel);

  pixel.src = pixelURL.toString()
  pixel.allow = "join-ad-interest-group " + pixelURL.origin;
  pixel.style.display = "none";
  document.body.appendChild(pixel);
};
