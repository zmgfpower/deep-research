import { useSettingStore } from "@/store/setting";
import { TAVILY_BASE_URL, FIRECRAWL_BASE_URL } from "@/constants/urls";
import { pick } from "radash";

type TavilySearchOptions = {
  searchDepth?: "basic" | "advanced";
  topic?: "general" | "news" | "finance";
  days?: number;
  maxResults?: number;
  includeImages?: boolean;
  includeImageDescriptions?: boolean;
  includeAnswer?: boolean;
  includeRawContent?: boolean;
  includeDomains?: undefined | Array<string>;
  excludeDomains?: undefined | Array<string>;
  maxTokens?: undefined | number;
  timeRange?: "year" | "month" | "week" | "day" | "y" | "m" | "w" | "d";
  chunksPerSource?: undefined | number;
  timeout?: number;
  [key: string]: any;
};

type TavilySearchResult = {
  title: string;
  url: string;
  content: string;
  rawContent?: string;
  score: number;
  publishedDate: string;
};

interface FirecrawlSearchOptions {
  limit?: number;
  tbs?: string;
  filter?: string;
  lang?: string;
  country?: string;
  location?: string;
  origin?: string;
  timeout?: number;
  scrapeOptions?: { formats: ("markdown" | "json")[] };
}

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

export function useWebSearch() {
  async function tavily(query: string, options: TavilySearchOptions = {}) {
    const { searchApiKey, searchApiProxy, searchMaxResult } =
      useSettingStore.getState();

    const response = await fetch(
      `${searchApiProxy || TAVILY_BASE_URL}/search`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${searchApiKey}`,
        },
        body: JSON.stringify({
          query,
          searchDepth: "basic",
          topic: "general",
          days: 3,
          maxResults: Number(searchMaxResult),
          includeImages: false,
          includeImageDescriptions: false,
          includeAnswer: false,
          includeRawContent: false,
          chunksPerSource: 3,
          ...options,
        } as TavilySearchOptions),
      }
    );
    const { results } = await response.json();
    return (results as TavilySearchResult[])
      .filter((item) => item.content && item.url)
      .map((result) => pick(result, ["title", "content", "url"])) as Source[];
  }

  async function firecrawl(
    query: string,
    options: FirecrawlSearchOptions = {}
  ) {
    const { searchApiKey, searchApiProxy, searchMaxResult, language } =
      useSettingStore.getState();

    const searchMeta = language.split("-");
    const response = await fetch(
      `${searchApiProxy || FIRECRAWL_BASE_URL}/v1/search`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${searchApiKey}`,
        },
        body: JSON.stringify({
          query,
          lang: searchMeta[0].toLowerCase(),
          country: searchMeta[1].toLowerCase(),
          limit: searchMaxResult,
          origin: "api",
          scrapeOptions: {
            formats: ["markdown"],
          },
          timeout: 60000,
          ...options,
        } as FirecrawlSearchOptions),
      }
    );
    const { data } = await response.json();
    return (data as FirecrawlDocument[])
      .filter((item) => item.description && item.url)
      .map((result) => ({
        content: result.markdown || result.description,
        url: result.url,
        title: result.title,
      })) as Source[];
  }

  return {
    tavily,
    firecrawl,
  };
}
