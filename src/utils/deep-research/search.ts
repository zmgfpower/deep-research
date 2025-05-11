import {
  TAVILY_BASE_URL,
  FIRECRAWL_BASE_URL,
  EXA_BASE_URL,
  BOCHA_BASE_URL,
  SEARXNG_BASE_URL,
} from "@/constants/urls";
import { rewritingPrompt } from "@/constants/prompts";
import { completePath } from "@/utils/url";
import { pick } from "radash";

type TavilySearchResult = {
  title: string;
  url: string;
  content: string;
  rawContent?: string;
  score: number;
  publishedDate: string;
};

interface FirecrawlDocument<T = unknown> {
  url?: string;
  markdown?: string;
  html?: string;
  rawHtml?: string;
  links?: string[];
  extract?: T;
  json?: T;
  screenshot?: string;
  compare?: {
    previousScrapeAt: string | null;
    changeStatus: "new" | "same" | "changed" | "removed";
    visibility: "visible" | "hidden";
  };
  // v1 search only
  title?: string;
  description?: string;
}

type ExaSearchResult = {
  title: string;
  url: string;
  publishedDate: string;
  author: string;
  score: number;
  id: string;
  image?: string;
  favicon: string;
  text?: string;
  highlights?: string[];
  highlightScores?: number[];
  summary?: string;
  subpages?: ExaSearchResult[];
  extras?: {
    links?: string[];
  };
};

type BochaSearchResult = {
  id: string | null;
  name: string;
  url: string;
  displayUrl: string;
  snippet: string;
  summary?: string;
  siteName: string;
  siteIcon: string;
  dateLastCrawled: string;
  cachedPageUrl: string | null;
  language: string | null;
  isFamilyFriendly: boolean | null;
  isNavigational: boolean | null;
};

type SearxngSearchResult = {
  url: string;
  title: string;
  content?: string;
  engine: string;
  parsed_url: string[];
  template: "default.html" | "videos.html" | "images.html";
  engines: string[];
  positions: number[];
  publishedDate?: Date | null;
  thumbnail?: null | string;
  is_onion?: boolean;
  score: number;
  category: string;
  length?: null | string;
  duration?: null | string;
  iframe_src?: string;
  source?: string;
  metadata?: string;
  resolution?: null | string;
  img_src?: string;
  thumbnail_src?: string;
  img_format?: "jpeg" | "Culture Snaxx" | "png";
};

export interface SearchProviderOptions {
  provider: string;
  baseURL?: string;
  apiKey?: string;
  query: string;
  maxResult?: number;
}

export async function createSearchProvider({
  provider,
  baseURL,
  apiKey = "",
  query,
  maxResult = 5,
}: SearchProviderOptions) {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`;

  if (provider === "tavily") {
    const response = await fetch(
      `${completePath(baseURL || TAVILY_BASE_URL)}/search`,
      {
        method: "POST",
        headers,
        credentials: "omit",
        body: JSON.stringify({
          query,
          searchDepth: "basic",
          topic: "general",
          days: 3,
          maxResults: Number(maxResult),
          includeImages: false,
          includeImageDescriptions: false,
          includeAnswer: false,
          includeRawContent: false,
          chunksPerSource: 3,
        }),
      }
    );
    const { results = [] } = await response.json();
    return (results as TavilySearchResult[])
      .filter((item) => item.content && item.url)
      .map((result) => pick(result, ["title", "content", "url"])) as Source[];
  } else if (provider === "firecrawl") {
    const response = await fetch(
      `${completePath(baseURL || FIRECRAWL_BASE_URL, "/v1")}/search`,
      {
        method: "POST",
        headers,
        credentials: "omit",
        body: JSON.stringify({
          query,
          limit: maxResult,
          origin: "api",
          scrapeOptions: {
            formats: ["markdown"],
          },
          timeout: 60000,
        }),
      }
    );
    const { data = [] } = await response.json();
    return (data as FirecrawlDocument[])
      .filter((item) => item.description && item.url)
      .map((result) => ({
        content: result.markdown || result.description,
        url: result.url,
        title: result.title,
      })) as Source[];
  } else if (provider === "exa") {
    const response = await fetch(
      `${completePath(baseURL || EXA_BASE_URL)}/search`,
      {
        method: "POST",
        headers,
        credentials: "omit",
        body: JSON.stringify({
          query,
          category: "research paper",
          contents: {
            text: true,
            summary: {
              query: `Given the following query from the user:\n<query>${query}</query>\n\n${rewritingPrompt}`,
            },
            numResults: Number(maxResult) * 5,
            livecrawl: "auto",
          },
        }),
      }
    );
    const { results = [] } = await response.json();
    return (results as ExaSearchResult[])
      .filter((item) => (item.summary || item.text) && item.url)
      .map((result) => ({
        content: result.summary || result.text,
        url: result.url,
        title: result.title,
      })) as Source[];
  } else if (provider === "bocha") {
    const response = await fetch(
      `${completePath(baseURL || BOCHA_BASE_URL, "/v1")}/web-search`,
      {
        method: "POST",
        headers,
        credentials: "omit",
        body: JSON.stringify({
          query,
          freshness: "noLimit",
          summary: true,
          count: maxResult,
        }),
      }
    );
    const { data = {} } = await response.json();
    const results = data.webPages?.value || [];
    return (results as BochaSearchResult[])
      .filter((item) => item.snippet && item.url)
      .map((result) => ({
        content: result.summary || result.snippet,
        url: result.url,
        title: result.name,
      })) as Source[];
  } else if (provider === "searxng") {
    const params = {
      q: query,
      categories: ["general", "web"],
      engines: ["google", "bing", "duckduckgo", "brave", "wikipedia"],
      lang: "auto",
      format: "json",
      autocomplete: "google",
    };
    const searchQuery = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      searchQuery.append(key, value.toString());
    }

    const response = await fetch(
      `${completePath(
        baseURL || SEARXNG_BASE_URL
      )}/search?${searchQuery.toString()}`,
      { method: "POST", credentials: "omit", headers }
    );
    const { results = [] } = await response.json();
    return (results as SearxngSearchResult[])
      .filter(
        (item, idx) =>
          item.content && item.url && idx < maxResult * 5 && item.score >= 0.5
      )
      .map((result) => pick(result, ["title", "content", "url"])) as Source[];
  } else {
    throw new Error("Unsupported Provider: " + provider);
  }
}
