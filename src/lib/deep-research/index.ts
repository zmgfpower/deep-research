import { streamText } from "ai";
import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";
import { google } from "@/lib/ai/providers";
import { systemPrompt } from "./prompt";

export function getSERPQuerySchema(numQueries = 5) {
  return z.object({
    queries: z
      .array(
        z
          .object({
            query: z.string().describe("The SERP query."),
            researchGoal: z
              .string()
              .describe(
                "First talk about the goal of the research that this query is meant to accomplish, then go deeper into how to advance the research once the results are found, mention additional research directions. Be as specific as possible, especially for additional research directions. JSON reserved words should be escaped."
              ),
          })
          .required({ query: true, researchGoal: true })
      )
      .describe(`List of SERP queries, max of ${numQueries}`),
  });
}

export async function generateSerpQueries({
  query,
  numQueries = 5,
  learnings,
}: {
  query: string;
  numQueries?: number;
  // optional, if provided, the research will continue from the last learning
  learnings?: string[];
}) {
  const SERPQuerySchema = getSERPQuerySchema(numQueries);
  const outputSchema = JSON.stringify(
    zodToJsonSchema(SERPQuerySchema),
    null,
    4
  );

  const prompt = [
    `Given the following prompt from the user, generate a list of SERP queries to research the topic. Return a maximum of ${numQueries} queries, but feel free to return less if the original prompt is clear. Make sure each query is unique and not similar to each other: <prompt>${query}</prompt>\n\n`,
    learnings
      ? `Here are some learnings from previous research, use them to generate more specific queries: ${learnings.join(
          "\n"
        )}`
      : "",
    `You MUST respond in JSON matching this JSON schema: \n\`\`\`json\n${outputSchema}\n\`\`\``,
  ].join("\n\n");

  return streamText({
    model: google("gemini-2.0-flash-thinking-exp"),
    system: systemPrompt(),
    prompt,
  });
}

export async function processSearchResult({
  query,
  researchGoal,
  numLearnings = 5,
}: {
  query: string;
  researchGoal: string;
  numLearnings?: number;
}) {
  const prompt = [
    `Use web search for the query: \n\n<query>${query}</query>`,
    `You need to organize the searched information according to the following requirements: \n\n<researchGoal>\n${researchGoal}\n</researchGoal>`,
    `Generate a list of learnings from the search results. Return a maximum of ${numLearnings} learnings, but feel free to return less if the contents are clear. Make sure each learning is unique and not similar to each other. The learnings should be to the point, as detailed and information dense as possible. Make sure to include any entities like people, places, companies, products, things, etc in the learnings, as well as any exact metrics, numbers, or dates. The learnings will be used to research the topic further.`,
  ].join("\n\n");

  return streamText({
    model: google("gemini-2.0-flash-exp", { useSearchGrounding: true }),
    system: systemPrompt(),
    prompt,
  });
}

export async function writeFinalReport({
  question,
  learnings,
}: {
  question: string;
  learnings: string[];
}) {
  const learningsString = learnings
    .map((learning) => `<learning>\n${learning}\n</learning>`)
    .join("\n");
  const prompt = [
    `Given the following question from the user, write a final report on the topic using the learnings from research. Make it as as detailed as possible, aim for 3 or more pages, include ALL the learnings from research:`,
    `<question>${question}</question>`,
    `Here are all the learnings from previous research:`,
    `<learnings>\n${learningsString}\n</learnings>`,
    `Write the report using Markdown.`,
  ].join("\n\n");

  return streamText({
    model: google("gemini-2.0-flash-thinking-exp"),
    system: systemPrompt(),
    prompt,
  });
}
