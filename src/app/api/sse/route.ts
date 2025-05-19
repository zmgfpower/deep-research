import { NextResponse, type NextRequest } from "next/server";
import DeepResearch from "@/utils/deep-research";
import { multiApiKeyPolling } from "@/utils/model";
import {
  getAIProviderBaseURL,
  getAIProviderApiKey,
  getSearchProviderBaseURL,
  getSearchProviderApiKey,
} from "../utils";
import { omit } from "radash";

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
    maxResult,
  } = await req.json();
  const encoder = new TextEncoder();
  const readableStream = new ReadableStream({
    start: async (controller) => {
      console.log("Client connected");
      controller.enqueue(
        encoder.encode(
          `event: infor\ndata: ${JSON.stringify({
            name: "deep-research",
            version: "0.1.0",
          })}\n\n`
        )
      );

      req.signal.addEventListener("abort", () => {
        console.log("Client disconnected");
      });

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
          maxResult,
        },
        onMessage: (event, data) => {
          let eventData: string = "";
          if (event === "message") {
            eventData = JSON.stringify({
              type: "text",
              text: data,
            });
          } else if (event === "progress") {
            console.log(`Progress: ${JSON.stringify(omit(data, ["data"]))}`);
            eventData = JSON.stringify(data);
            if (data.step === "final-report") {
              controller.close();
            }
          } else if (event === "error") {
            console.error(event, data);
            eventData = JSON.stringify({
              message: data,
            });
            controller.close();
          } else {
            console.warn(`Unknown event: ${event}`);
          }
          controller.enqueue(
            encoder.encode(`event: ${event}\ndata: ${eventData})}\n\n`)
          );
        },
      });

      await deepResearch.run();
      controller.close();
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
