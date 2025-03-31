import { useSettingStore } from "@/store/setting";
import { pick } from "radash";

function useWebSearch() {
  async function tavily() {
    const { searchApiKey } = useSettingStore.getState();

    const Tavily = await import("@tavily/core");
    const provider = Tavily.tavily({
      apiKey: searchApiKey,
    });

    return async (query: string) => {
      const { searchMaxResult } = useSettingStore.getState();
      const { results } = await provider.search(query, {
        maxResults: Number(searchMaxResult),
        topic: "general",
        searchDepth: "basic",
      });

      return results
        .filter((item) => item.content && item.url)
        .map((result) => pick(result, ["title", "content", "url"]));
    };
  }

  async function firecrawl() {
    const { searchApiKey, searchApiProxy } = useSettingStore.getState();

    const { default: Firecrawl } = await import("@mendable/firecrawl-js");
    const provider = new Firecrawl({
      apiKey: searchApiKey,
      apiUrl: searchApiProxy ? searchApiProxy : undefined,
    });

    return async (query: string) => {
      const { searchMaxResult, language } = useSettingStore.getState();
      const { data: results } = await provider.search(query, {
        lang: language.split("-")[0],
        limit: searchMaxResult,
        scrapeOptions: {
          formats: ["markdown"],
        },
      });

      return results
        .filter((item) => item.markdown && item.url)
        .map((result) => ({
          content: result.markdown,
          url: result.url,
          title: result.title,
        }));
    };
  }

  return {
    tavily,
    firecrawl,
  };
}

export default useWebSearch;
