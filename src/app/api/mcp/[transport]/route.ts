import { z } from "zod";
import createMcpRouteHandler from "@/utils/mcp-server";
import DeepResearch from "@/utils/deep-research";
import { multiApiKeyPolling } from "@/utils/model";
import {
  getAIProviderBaseURL,
  getAIProviderApiKey,
  getSearchProviderBaseURL,
  getSearchProviderApiKey,
} from "../../utils";

const AI_PROVIDER = process.env.MCP_AI_PROVIDER || "";
const SEARCH_PROVIDER = process.env.MCP_SEARCH_PROVIDER || "";
const THINKING_MODEL = process.env.MCP_THINKING_MODEL || "";
const TASK_MODEL = process.env.MCP_TASK_MODEL || "";

const handler = createMcpRouteHandler(
  (server) => {
    server.tool(
      "deep-research",
      "Use any LLMs (Large Language Models) for Deep Research.",
      {
        query: z.string().describe("The research query to investigate."),
        language: z
          .string()
          .optional()
          .describe("The final report text language."),
        parallel: z
          .number()
          .optional()
          .default(1)
          .describe("The number of parallel searches."),
        maxResult: z
          .number()
          .optional()
          .default(5)
          .describe("Maximum number of search results."),
      },
      async ({ query, language, parallel, maxResult }) => {
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
            apiKey: multiApiKeyPolling(
              getSearchProviderApiKey(SEARCH_PROVIDER)
            ),
            provider: SEARCH_PROVIDER,
            parallel,
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
  },
  {
    name: "deep-research",
    version: "0.1.0",
  },
  // Optional: Comes from the McpServer.options
  {
    capabilities: {
      tools: {
        "deep-research": {
          description:
            "Use any LLMs (Large Language Models) for Deep Research.",
        },
      },
    },
  },
  // Optional: Comes from the createMcpRouteHandler config
  {
    basePath: "/api/mcp",
  }
);

export { handler as GET, handler as POST };
