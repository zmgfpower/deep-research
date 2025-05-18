import { z } from "zod";
import { McpServer } from "@/libs/mcp-server/mcp";
import DeepResearch from "@/utils/deep-research";
import { multiApiKeyPolling } from "@/utils/model";
import {
  getAIProviderBaseURL,
  getAIProviderApiKey,
  getSearchProviderBaseURL,
  getSearchProviderApiKey,
} from "../utils";

const AI_PROVIDER = process.env.MCP_AI_PROVIDER || "";
const SEARCH_PROVIDER = process.env.MCP_SEARCH_PROVIDER || "";
const THINKING_MODEL = process.env.MCP_THINKING_MODEL || "";
const TASK_MODEL = process.env.MCP_TASK_MODEL || "";

export function initMcpServer() {
  const server = new McpServer(
    {
      name: "deep-research",
      version: "0.1.0",
    },
    {
      capabilities: {
        tools: {
          "deep-research": {
            description:
              "Use any LLMs (Large Language Models) for Deep Research.",
          },
        },
      },
    }
  );

  server.tool(
    "deep-research",
    "Use any LLMs (Large Language Models) for Deep Research.",
    {
      query: z.string().describe("The research query to investigate."),
      language: z
        .string()
        .optional()
        .describe("The final report text language."),
      maxResult: z
        .number()
        .optional()
        .default(5)
        .describe("Maximum number of search results."),
    },
    async ({ query, language, maxResult }) => {
      const deepResearch = new DeepResearch({
        query,
        language,
        AIProvider: {
          baseURL: getAIProviderBaseURL(AI_PROVIDER),
          apiKey: multiApiKeyPolling(getAIProviderApiKey(AI_PROVIDER)),
          provider: AI_PROVIDER,
          thinkingModel: THINKING_MODEL,
          taskModel: TASK_MODEL,
        },
        searchProvider: {
          baseURL: getSearchProviderBaseURL(SEARCH_PROVIDER),
          apiKey: multiApiKeyPolling(getSearchProviderApiKey(SEARCH_PROVIDER)),
          provider: SEARCH_PROVIDER,
          maxResult,
        },
        onMessage: (event, data) => {
          console.log(event, data);
        },
      });

      const result = await deepResearch.run();
      return {
        content: [{ type: "text", text: JSON.stringify(result) }],
      };
    }
  );

  return server;
}
