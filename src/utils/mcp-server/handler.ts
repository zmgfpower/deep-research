import {
  type IncomingHttpHeaders,
  IncomingMessage,
  ServerResponse,
} from "node:http";
import { Socket } from "node:net";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import type { ServerOptions } from "@modelcontextprotocol/sdk/server/index.js";

type BodyType = string | Buffer | Record<string, any> | null;
interface SerializedRequest {
  requestId: string;
  url: string;
  method: string;
  body: BodyType;
  headers: IncomingHttpHeaders;
}

interface Implementation {
  [x: string]: unknown;
  name: string;
  version: string;
}

function createLogger(verboseLogs = false) {
  return {
    log: (...args: unknown[]) => {
      if (verboseLogs) console.log(...args);
    },
    error: (...args: unknown[]) => {
      if (verboseLogs) console.error(...args);
    },
    warn: (...args: unknown[]) => {
      if (verboseLogs) console.warn(...args);
    },
    info: (...args: unknown[]) => {
      if (verboseLogs) console.info(...args);
    },
    debug: (...args: unknown[]) => {
      if (verboseLogs) console.debug(...args);
    },
  };
}
/**
 * Configuration for the MCP handler.
 * @property verboseLogs - If true, enables console logging.
 */
export type Config = {
  /**
   * The maximum duration of an MCP request in seconds.
   * @default 60
   */
  maxDuration?: number;
  /**
   * If true, enables console logging.
   * @default false
   */
  verboseLogs?: boolean;
  /**
   * The base path to use for deriving endpoints.
   * If provided, endpoints will be derived from this path.
   * For example, if basePath is "/", that means your routing is:
   *  /app/[transport]/route.ts and then:
   * - streamableHttpEndpoint will be "/mcp"
   * - sseEndpoint will be "/sse"
   * - sseMessageEndpoint will be "/message"
   * @default ""
   */
  basePath: string;
};

/**
 * Derives MCP endpoints from a base path.
 * @param basePath - The base path to derive endpoints from
 * @returns An object containing the derived endpoints
 */
function deriveEndpointsFromBasePath(basePath: string): {
  streamableHttpEndpoint: string;
  sseEndpoint: string;
  sseMessageEndpoint: string;
} {
  // Remove trailing slash if present
  const normalizedBasePath = basePath.replace(/\/$/, "");

  return {
    streamableHttpEndpoint: `${normalizedBasePath}/mcp`,
    sseEndpoint: `${normalizedBasePath}/sse`,
    sseMessageEndpoint: `${normalizedBasePath}/message`,
  };
}
/**
 * Calculates the endpoints for the MCP handler.
 * @param config - The configuration for the MCP handler.
 * @returns An object containing the endpoints for the MCP handler.
 */
export function calculateEndpoints({ basePath }: Config) {
  const {
    streamableHttpEndpoint: fullStreamableHttpEndpoint,
    sseEndpoint: fullSseEndpoint,
    sseMessageEndpoint: fullSseMessageEndpoint,
  } = deriveEndpointsFromBasePath(basePath);

  return {
    streamableHttpEndpoint: fullStreamableHttpEndpoint,
    sseEndpoint: fullSseEndpoint,
    sseMessageEndpoint: fullSseMessageEndpoint,
  };
}

export function initializeMcpApiHandler(
  initializeServer: (server: McpServer) => void,
  serverInfo: Implementation,
  serverOptions: ServerOptions = {},
  config: Config = {
    basePath: "",
    maxDuration: 60,
    verboseLogs: false,
  }
) {
  const { basePath, maxDuration, verboseLogs } = config;

  // If basePath is provided, derive endpoints from it
  const { streamableHttpEndpoint, sseEndpoint, sseMessageEndpoint } =
    calculateEndpoints({
      basePath,
    });

  const logger = createLogger(verboseLogs);

  let transport: any;

  return async function mcpApiHandler(req: Request, res: ServerResponse) {
    const url = new URL(req.url || "");

    // Handles messages originally received via /message
    const handleMessage = async (message: string) => {
      const request = JSON.parse(message) as SerializedRequest;

      // Make in IncomingMessage object because that is what the SDK expects.
      const req = createFakeIncomingMessage({
        method: request.method,
        url: request.url,
        headers: request.headers,
        body: request.body, // This could already be an object from earlier parsing
      });
      const syntheticRes = new ServerResponse(req);
      let status = 100;
      let body = "";
      syntheticRes.writeHead = (statusCode: number) => {
        status = statusCode;
        return syntheticRes;
      };
      syntheticRes.end = (b: unknown) => {
        body = b as string;
        return syntheticRes;
      };
      await transport.handlePostMessage(req, syntheticRes);

      const response = JSON.parse(
        JSON.stringify({
          status,
          body,
        })
      ) as {
        status: number;
        body: string;
      };
      res.statusCode = response.status;
      res.end(response.body);
    };

    if (url.pathname === streamableHttpEndpoint) {
      if (req.method === "GET") {
        logger.log("Received GET MCP request");
        res.writeHead(405).end(
          JSON.stringify({
            jsonrpc: "2.0",
            error: {
              code: -32000,
              message: "Method not allowed.",
            },
            id: null,
          })
        );
        return;
      }
      if (req.method === "DELETE") {
        logger.log("Received DELETE MCP request");
        res.writeHead(405).end(
          JSON.stringify({
            jsonrpc: "2.0",
            error: {
              code: -32000,
              message: "Method not allowed.",
            },
            id: null,
          })
        );
        return;
      }

      if (req.method === "POST") {
        logger.log("Got new MCP connection", req.url, req.method);

        const server = new McpServer(serverInfo, serverOptions);
        initializeServer(server);
        const statelessTransport = new StreamableHTTPServerTransport({
          sessionIdGenerator: undefined,
        });
        await server.connect(statelessTransport);

        // Parse the request body
        let bodyContent: BodyType;
        const contentType = req.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          bodyContent = await req.json();
        } else {
          bodyContent = await req.text();
        }

        const incomingRequest = createFakeIncomingMessage({
          method: req.method,
          url: req.url,
          headers: Object.fromEntries(req.headers),
          body: bodyContent,
        });
        await statelessTransport.handleRequest(incomingRequest, res);
      }
    } else if (url.pathname === sseEndpoint) {
      logger.log("Got new SSE connection");
      transport = new SSEServerTransport(sseMessageEndpoint, res);
      const sessionId = transport.sessionId;
      const server = new McpServer(serverInfo, serverOptions);
      initializeServer(server);

      server.server.onclose = () => {
        logger.log("SSE connection closed");
      };

      logger.log(`Subscribed to requests:${sessionId}`);

      let timeout: NodeJS.Timeout;
      let resolveTimeout: (value: unknown) => void;
      const waitPromise = new Promise((resolve) => {
        resolveTimeout = resolve;
        timeout = setTimeout(() => {
          resolve("max duration reached");
        }, (maxDuration ?? 60) * 1000);
      });

      async function cleanup() {
        clearTimeout(timeout);
        logger.log("Done");
        res.statusCode = 200;
        res.end();
      }
      req.signal.addEventListener("abort", () =>
        resolveTimeout("client hang up")
      );

      await server.connect(transport);
      const closeReason = await waitPromise;
      logger.log(closeReason);
      await cleanup();
    } else if (url.pathname === sseMessageEndpoint) {
      logger.log("Received message");

      const body = await req.text();
      let parsedBody: BodyType;
      try {
        parsedBody = JSON.parse(body);
      } catch (err) {
        parsedBody = body;
        logger.error(err);
      }

      const sessionId = url.searchParams.get("sessionId") || "";
      if (!sessionId) {
        res.statusCode = 400;
        res.end("No sessionId provided");
        return;
      }
      const requestId = crypto.randomUUID();
      const serializedRequest: SerializedRequest = {
        requestId,
        url: req.url || "",
        method: req.method || "",
        body: parsedBody,
        headers: Object.fromEntries(req.headers.entries()),
      };

      // Queue the request in Redis so that a subscriber can pick it up.
      // One queue per session.
      handleMessage(JSON.stringify(serializedRequest));
      logger.log(`Published requests:${sessionId}`, serializedRequest);

      const timeout = setTimeout(async () => {
        res.statusCode = 408;
        res.end("Request timed out");
      }, 10 * 1000);

      res.on("close", async () => {
        clearTimeout(timeout);
      });
    } else {
      res.statusCode = 404;
      res.end("Not found");
    }
  };
}

// Define the options interface
interface FakeIncomingMessageOptions {
  method?: string;
  url?: string;
  headers?: IncomingHttpHeaders;
  body?: BodyType;
  socket?: Socket;
}

// Create a fake IncomingMessage
function createFakeIncomingMessage(
  options: FakeIncomingMessageOptions = {}
): IncomingMessage {
  const {
    method = "GET",
    url = "/",
    headers = {},
    body = null,
    socket = new Socket(),
  } = options;

  // Create the IncomingMessage instance
  const req = new IncomingMessage(socket);

  // Add the body content if provided
  if (body) {
    if (typeof body === "string") {
      req.push(body);
    } else if (Buffer.isBuffer(body)) {
      req.push(body);
    } else {
      // Ensure proper JSON-RPC format
      req.push(JSON.stringify(body));
    }
  }
  req.push(null); // Signal the end of the stream

  // Set the properties
  req.method = method;
  req.url = url;
  req.headers = headers;

  return req;
}
