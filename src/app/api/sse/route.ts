import { NextResponse, type NextRequest } from "next/server";
import DeepResearch from "@/utils/deep-research";
import { multiApiKeyPolling } from "@/utils/model";
import {
  getAIProviderBaseURL,
  getAIProviderApiKey,
  getSearchProviderBaseURL,
  getSearchProviderApiKey,
} from "../utils";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const preferredRegion = [
  "cle1",
  "iad1",
  "pdx1",
  "sfo1",
  "sin1",
  "syd1",
  "hnd1",
  "kix1",
];

export async function POST(req: NextRequest) {
  const {
    query,
    provider,
    thinkingModel,
    taskModel,
    searchProvider,
    language,
    parallel,
    maxResult,
  } = await req.json();
  const encoder = new TextEncoder();
  const readableStream = new ReadableStream({
    start(controller) {
      console.log("Client connected");
      controller.enqueue(encoder.encode(`data: client connected\n\n`));

      const deepResearch = new DeepResearch({
        query,
        language,
        AIProvider: {
          baseURL: getAIProviderBaseURL(provider),
          apiKey: multiApiKeyPolling(getAIProviderApiKey(provider)),
          provider,
          thinkingModel,
          taskModel,
        },
        searchProvider: {
          baseURL: getSearchProviderBaseURL(searchProvider),
          apiKey: multiApiKeyPolling(getSearchProviderApiKey(searchProvider)),
          provider: searchProvider,
          parallel,
          maxResult,
        },
        onMessage: (event, data) => {
          const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(message));
          if (event === "final-report") {
            controller.close();
            console.log(`Step: ${event}`);
          } else if (event === "error") {
            console.error(event, data);
            controller.close();
          } else {
            console.log(`Step: ${event}`);
          }
        },
      });

      deepResearch.run();

      req.signal.addEventListener("abort", () => {
        controller.enqueue(encoder.encode(`data: client disconnected\n\n`));
        controller.close();
        console.log("Client disconnected");
      });
    },
    cancel() {
      console.log("Stream cancelled");
    },
  });

  return new NextResponse(readableStream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
