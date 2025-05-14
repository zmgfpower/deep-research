import type { ServerOptions } from "@modelcontextprotocol/sdk/server/index.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { type Config, initializeMcpApiHandler } from "./handler";
import { createServerResponseAdapter } from "./adapter";

interface Implementation {
  [x: string]: unknown;
  name: string;
  version: string;
}

/**
 * Creates a MCP handler that can be used to handle MCP requests.
 * @param initializeServer - A function that initializes the MCP server. Use this to access the server instance and register tools, prompts, and resources.
 * @param serverOptions - Options for the MCP server.
 * @param config - Configuration for the MCP handler.
 * @returns A function that can be used to handle MCP requests.
 */
export default function createMcpRouteHandler(
  initializeServer: (server: McpServer) => void,
  serverInfo: Implementation,
  serverOptions?: ServerOptions,
  config?: Config
): (request: Request) => Promise<Response> {
  const mcpHandler = initializeMcpApiHandler(
    initializeServer,
    serverInfo,
    serverOptions,
    config
  );
  return (request: Request) => {
    return createServerResponseAdapter(request.signal, (res) => {
      mcpHandler(request, res);
    });
  };
}
