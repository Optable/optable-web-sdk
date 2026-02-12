type SemanticContent = {
  title: string;
  description?: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogTags?: Record<string, string>;
  headings?: Array<{ level: number; text: string }>;
  content?: string;
  jsonLd?: object[];
  language?: string;
};

type ContextData = {
  semantic: SemanticContent;
  html?: string;
  url: string;
  referrer?: string;
  extractedAt: number;
};

type PageContextConfig = {
  includeHtml?: boolean;
  contentSelector?: string;
  maxContentLength?: number;
  maxHtmlLength?: number;
};

const DEFAULT_MAX_CONTENT_LENGTH = 5000;
const DEFAULT_MAX_HTML_LENGTH = 50000;
const MAX_HEADINGS = 20;

function extractSemanticContent(config: PageContextConfig): SemanticContent {
  const semantic: SemanticContent = {
    title: document.title || "",
  };

  // Extract meta description
  const descriptionMeta = document.querySelector('meta[name="description"]');
  if (descriptionMeta) {
    const content = descriptionMeta.getAttribute("content");
    if (content) {
      semantic.description = content;
    }
  }

  // Extract meta keywords
  const keywordsMeta = document.querySelector('meta[name="keywords"]');
  if (keywordsMeta) {
    const content = keywordsMeta.getAttribute("content");
    if (content) {
      semantic.keywords = content
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);
    }
  }

  // Extract canonical URL
  const canonicalLink = document.querySelector('link[rel="canonical"]');
  if (canonicalLink) {
    const href = canonicalLink.getAttribute("href");
    if (href) {
      semantic.canonicalUrl = href;
    }
  }

  // Extract Open Graph tags
  const ogTags: Record<string, string> = {};
  document.querySelectorAll('meta[property^="og:"]').forEach((meta) => {
    const property = meta.getAttribute("property");
    const content = meta.getAttribute("content");
    if (property && content) {
      const key = property.replace("og:", "");
      ogTags[key] = content;
    }
  });
  if (Object.keys(ogTags).length > 0) {
    semantic.ogTags = ogTags;
  }

  // Extract headings (h1-h3, max 20)
  const headings: Array<{ level: number; text: string }> = [];
  document.querySelectorAll("h1, h2, h3").forEach((heading) => {
    if (headings.length >= MAX_HEADINGS) return;
    const level = parseInt(heading.tagName.substring(1), 10);
    const text = heading.textContent?.trim();
    if (text) {
      headings.push({ level, text });
    }
  });
  if (headings.length > 0) {
    semantic.headings = headings;
  }

  // Extract main content
  const maxContentLength = config.maxContentLength ?? DEFAULT_MAX_CONTENT_LENGTH;
  const contentElement = findContentElement(config.contentSelector);
  if (contentElement) {
    const text = extractTextContent(contentElement);
    if (text) {
      semantic.content = text.substring(0, maxContentLength);
    }
  }

  // Extract JSON-LD
  const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
  const jsonLdData: object[] = [];
  jsonLdScripts.forEach((script) => {
    try {
      const data = JSON.parse(script.textContent || "");
      if (data && typeof data === "object") {
        jsonLdData.push(data);
      }
    } catch {
      // Ignore invalid JSON-LD
    }
  });
  if (jsonLdData.length > 0) {
    semantic.jsonLd = jsonLdData;
  }

  // Extract language
  const lang = document.documentElement.getAttribute("lang");
  if (lang) {
    semantic.language = lang;
  }

  return semantic;
}

function findContentElement(selector?: string): Element | null {
  // Use provided selector if available
  if (selector) {
    return document.querySelector(selector);
  }

  // Fall back to heuristics: main, article, or first large content block
  const candidates = ["main", "article", '[role="main"]', ".content", "#content", ".post", ".article"];

  for (const candidate of candidates) {
    const element = document.querySelector(candidate);
    if (element) {
      return element;
    }
  }

  // Last resort: body
  return document.body;
}

function extractTextContent(element: Element): string {
  if (element instanceof HTMLElement && element.innerText) {
    return element.innerText.trim();
  }
  return "";
}

function extractContext(config: PageContextConfig): ContextData {
  const contextData: ContextData = {
    semantic: extractSemanticContent(config),
    url: window.location.href,
    extractedAt: Date.now(),
  };

  // Include referrer if available
  if (document.referrer) {
    contextData.referrer = document.referrer;
  }

  // Include HTML if configured
  if (config.includeHtml) {
    const maxHtmlLength = config.maxHtmlLength ?? DEFAULT_MAX_HTML_LENGTH;
    contextData.html = document.documentElement.outerHTML.substring(0, maxHtmlLength);
  }

  return contextData;
}

function normalizeContextConfig(config: PageContextConfig | boolean | undefined): PageContextConfig | null {
  if (!config) {
    return null;
  }

  if (config === true) {
    return {};
  }

  return config;
}

export type { SemanticContent, ContextData, PageContextConfig };
export { extractContext, extractSemanticContent, normalizeContextConfig };
