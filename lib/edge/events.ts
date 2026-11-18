import type { ResolvedConfig } from "../config";
import { fetch } from "../core/network";

type PageViewPayload = {
  page: {
    url: string;
    referrer: string;
    title: string;
    language: string;
  };
  utm: UTMParams;
};

type UTMParams = {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
};

function utmParams(url: string): UTMParams {
  const params = new URL(url).searchParams;
  return {
    source: params.get("utm_source") ?? undefined,
    medium: params.get("utm_medium") ?? undefined,
    campaign: params.get("utm_campaign") ?? undefined,
    term: params.get("utm_term") ?? undefined,
    content: params.get("utm_content") ?? undefined,
  };
}

function PageView(config: ResolvedConfig): Promise<void> {
  const url = window.location.href;
  const payload: PageViewPayload = {
    page: {
      url,
      referrer: document.referrer,
      title: document.title,
      language: navigator.language,
    },
    utm: utmParams(url),
  };

  return fetch("/events", config, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export { PageView };
export default PageView;
