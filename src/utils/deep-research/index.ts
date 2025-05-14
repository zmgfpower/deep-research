import { generateText } from "ai";
import { type GoogleGenerativeAIProviderMetadata } from "@ai-sdk/google";
import { createAIProvider } from "./provider";
import { createSearchProvider } from "./search";
import {
  getSystemPrompt,
  writeReportPlanPrompt,
  generateSerpQueriesPrompt,
  processResultPrompt,
  processSearchResultPrompt,
  writeFinalReportPrompt,
  getSERPQuerySchema,
} from "./prompts";
import { outputGuidelinesPrompt } from "@/constants/prompts";
import { isNetworkingModel } from "@/utils/model";
import { pick, unique, flat, isFunction } from "radash";

export interface DeepResearchOptions {
  AIProvider: {
    baseURL?: string;
    apiKey?: string;
    provider: string;
    thinkingModel: string;
    taskModel: string;
  };
  searchProvider: {
    baseURL?: string;
    apiKey?: string;
    provider: string;
    parallel?: number;
    maxResult?: number;
  };
  query: string;
  language?: string;
  onMessage?: (event: string, data: any) => void;
}

export function removeJsonMarkdown(text: string) {
  text = text.trim();
  if (text.startsWith("```json")) {
    text = text.slice(7);
  } else if (text.startsWith("json")) {
    text = text.slice(4);
  } else if (text.startsWith("```")) {
    text = text.slice(3);
  }
  if (text.endsWith("```")) {
    text = text.slice(0, -3);
  }
  return text.trim();
}

class DeepResearch {
  protected options: DeepResearchOptions;
  onMessage: (event: string, data: any) => void = () => {};
  constructor(options: DeepResearchOptions) {
    this.options = options;
    if (isFunction(options.onMessage)) {
      this.onMessage = options.onMessage;
    }
  }

  async getThinkingModel() {
    const { AIProvider } = this.options;
    const AIProviderBaseOptions = pick(AIProvider, ["baseURL", "apiKey"]);
    return await createAIProvider({
      provider: AIProvider.provider,
      model: AIProvider.thinkingModel,
      ...AIProviderBaseOptions,
    });
  }

  async getTaskModel() {
    const { AIProvider } = this.options;
    const AIProviderBaseOptions = pick(AIProvider, ["baseURL", "apiKey"]);
    return await createAIProvider({
      provider: AIProvider.provider,
      model: AIProvider.taskModel,
      settings:
        AIProvider.provider === "google" &&
        isNetworkingModel(AIProvider.taskModel)
          ? { useSearchGrounding: true }
          : undefined,
      ...AIProviderBaseOptions,
    });
  }

  getResponseLanguagePrompt() {
    return this.options.language
      ? `**Respond in ${this.options.language}**`
      : `**Respond in the same language as the user's query**`;
  }

  async writeReportPlan(query: string) {
    const { text } = await generateText({
      model: await this.getThinkingModel(),
      system: getSystemPrompt(),
      prompt: [
        writeReportPlanPrompt(query),
        this.getResponseLanguagePrompt(),
      ].join("\n\n"),
    });
    this.onMessage("report-plan", text);
    return text;
  }

  async generateSERPQuery(reportPlan: string) {
    const { text } = await generateText({
      model: await this.getThinkingModel(),
      system: getSystemPrompt(),
      prompt: [
        generateSerpQueriesPrompt(reportPlan),
        this.getResponseLanguagePrompt(),
      ].join("\n\n"),
    });
    const querySchema = getSERPQuerySchema();
    const data = JSON.parse(removeJsonMarkdown(text));
    const result = querySchema.safeParse(data);
    if (result.success) {
      const tasks = data.map(
        (item: { query: string; researchGoal: string }) => ({
          state: "unprocessed",
          learning: "",
          ...pick(item, ["query", "researchGoal"]),
        })
      );
      this.onMessage("serp-query", tasks);
      return tasks;
    } else {
      throw new Error(result.error.message);
    }
  }

  async runSearchTask(tasks: SearchTask[]) {
    const results: SearchTask[] = [];
    for await (const item of tasks) {
      let searchResult: string;
      let sources: Source[] = [];
      if (this.options.searchProvider.provider === "model") {
        const getTools = async () => {
          // Enable OpenAI's built-in search tool
          if (
            this.options.searchProvider.provider === "model" &&
            ["openai", "azure"].includes(this.options.AIProvider.taskModel) &&
            this.options.AIProvider.taskModel.startsWith("gpt-4o")
          ) {
            const { openai } = await import("@ai-sdk/openai");
            return {
              web_search_preview: openai.tools.webSearchPreview({
                // optional configuration:
                searchContextSize: "medium",
              }),
            };
          } else {
            return undefined;
          }
        };
        const getProviderOptions = () => {
          // Enable OpenRouter's built-in search tool
          if (
            this.options.searchProvider.provider === "model" &&
            this.options.AIProvider.taskModel === "openrouter"
          ) {
            return {
              openrouter: {
                plugins: [
                  {
                    id: "web",
                    max_results: this.options.searchProvider.maxResult ?? 5,
                  },
                ],
              },
            };
          } else {
            return undefined;
          }
        };

        const {
          text,
          providerMetadata,
          sources: rawSources,
        } = await generateText({
          model: await this.getTaskModel(),
          system: getSystemPrompt(),
          prompt: [
            processResultPrompt(item.query, item.researchGoal),
            this.getResponseLanguagePrompt(),
          ].join("\n\n"),
          tools: await getTools(),
          providerOptions: getProviderOptions(),
        });

        searchResult = text;
        sources = rawSources;
        this.onMessage("search-result", rawSources);

        if (providerMetadata?.google) {
          const { groundingMetadata } = providerMetadata.google;
          const googleGroundingMetadata =
            groundingMetadata as GoogleGenerativeAIProviderMetadata["groundingMetadata"];
          if (googleGroundingMetadata?.groundingSupports) {
            googleGroundingMetadata.groundingSupports.forEach(
              ({ segment, groundingChunkIndices }) => {
                if (segment.text && groundingChunkIndices) {
                  const index = groundingChunkIndices.map(
                    (idx: number) => `[${idx + 1}]`
                  );
                  searchResult = searchResult.replaceAll(
                    segment.text,
                    `${segment.text}${index.join("")}`
                  );
                }
              }
            );
          }
        } else if (providerMetadata?.openai) {
          // Fixed the problem that OpenAI cannot generate markdown reference link syntax properly in Chinese context
          searchResult = searchResult
            .replaceAll("【", "[")
            .replaceAll("】", "]");
        }
      } else {
        try {
          sources = await createSearchProvider({
            query: item.query,
            ...this.options.searchProvider,
          });

          this.onMessage("search-result", sources);

          if (sources.length === 0) {
            throw new Error("Invalid Search Results");
          }
        } catch (err) {
          console.error(err);
          throw new Error(
            `[${this.options.searchProvider.provider}]: ${
              err instanceof Error ? err.message : "Search Failed"
            }`
          );
        }
        const { text } = await generateText({
          model: await this.getTaskModel(),
          system: getSystemPrompt(),
          prompt: [
            processSearchResultPrompt(item.query, item.researchGoal, sources),
            this.getResponseLanguagePrompt(),
          ].join("\n\n"),
        });
        searchResult = text;
      }

      if (sources.length > 0) {
        searchResult +=
          "\n\n" +
          sources
            .map(
              (item, idx) =>
                `[${idx + 1}]: ${item.url}${
                  item.title ? ` "${item.title.replaceAll('"', " ")}"` : ""
                }`
            )
            .join("\n");
      }

      const task: SearchTask = {
        query: item.query,
        researchGoal: item.researchGoal,
        state: "completed",
        learning: searchResult,
        sources,
      };
      results.push(task);
      this.onMessage("search-task", task);
    }
    return results;
  }

  async writeFinalReport(reportPlan: string, tasks: SearchTask[]) {
    let finalReport = "";
    const learnings = tasks.map((item) => item.learning);
    const sources: Source[] = unique(
      flat(tasks.map((item) => (item.sources ? item.sources : []))),
      (item) => item.url
    );
    const { text } = await generateText({
      model: await this.getThinkingModel(),
      system: [getSystemPrompt(), outputGuidelinesPrompt].join("\n\n"),
      prompt: [
        writeFinalReportPrompt(
          reportPlan,
          learnings,
          sources.map((item) => pick(item, ["title", "url"])),
          ""
        ),
        this.getResponseLanguagePrompt(),
      ].join("\n\n"),
    });
    finalReport = text;
    if (sources.length > 0) {
      finalReport +=
        "\n\n" +
        sources
          .map(
            (item, idx) =>
              `[${idx + 1}]: ${item.url}${
                item.title ? ` "${item.title.replaceAll('"', " ")}"` : ""
              }`
          )
          .join("\n");
    }
    const title = text
      .split("\n")[0]
      .replaceAll("#", "")
      .replaceAll("*", "")
      .trim();

    const result = {
      title,
      finalReport,
      learnings,
      sources,
    };
    this.onMessage("final-report", result);
    return result;
  }

  async run() {
    try {
      const reportPlan = await this.writeReportPlan(this.options.query);
      const tasks = await this.generateSERPQuery(reportPlan);
      const results = await this.runSearchTask(tasks);
      const finalReport = await this.writeFinalReport(reportPlan, results);
      return finalReport;
    } catch (err) {
      this.onMessage(
        "error",
        err instanceof Error ? err.message : "Unknown error"
      );
    }
  }
}

export default DeepResearch;
