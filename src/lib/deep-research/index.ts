import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";

export function getSERPQuerySchema(numQueries = 3) {
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

export function generateSerpQueriesPrompt({
  question,
  numQueries = 3,
}: {
  question: string;
  numQueries?: number;
}) {
  const SERPQuerySchema = getSERPQuerySchema(numQueries);
  const outputSchema = JSON.stringify(
    zodToJsonSchema(SERPQuerySchema),
    null,
    4
  );

  return [
    `Given the following question from the user, generate a list of SERP queries to research the topic. Return a maximum of ${numQueries} queries, but feel free to return less if the original question is clear. Make sure each query is unique and not similar to each other:\n<question>${question}</question>\n\n`,
    `You MUST respond in JSON matching this JSON schema: \n\`\`\`json\n${outputSchema}\n\`\`\``,
  ].join("\n\n");
}

export function processSearchResultPrompt({
  query,
  researchGoal,
  numLearnings = 5,
}: {
  query: string;
  researchGoal: string;
  numLearnings?: number;
}) {
  return [
    `Please use the following query to get the latest information via google search tool:\n<query>${query}</query>`,
    `You need to organize the searched information according to the following requirements:\n<researchGoal>\n${researchGoal}\n</researchGoal>`,
    `You need to think like a human researcher. Generate a list of learnings from the search results. Return a maximum of ${numLearnings} learnings, but feel free to return less if the contents are clear. Make sure each learning is unique and not similar to each other. The learnings should be to the point, as detailed and information dense as possible. Make sure to include any entities like people, places, companies, products, things, etc in the learnings, as well as any specific entities, metrics, numbers, and dates when available. The learnings will be used to research the topic further.`,
  ].join("\n\n");
}

export function reviewSerpQueriesPrompt({
  question,
  learnings,
  numQueries = 3,
}: {
  question: string;
  learnings: string[];
  numQueries?: number;
}) {
  const SERPQuerySchema = getSERPQuerySchema(numQueries);
  const outputSchema = JSON.stringify(
    zodToJsonSchema(SERPQuerySchema),
    null,
    4
  );
  const learningsString = learnings
    .map((learning) => `<learning>\n${learning}\n</learning>`)
    .join("\n");
  return [
    `Given the following question from the user:\n<question>${question}</question>\n\n`,
    `Here are all the learnings from previous research:`,
    `<learnings>\n${learningsString}\n</learnings>`,
    `Based on previous research, determine whether further research is needed.`,
    `If further research is needed, list of follow-up SERP queries to research the topic further, max of ${numQueries} queries. Make sure each query is unique and not similar to each other.`,
    `If you believe no further research is needed, you can output an empty queries.`,
    `You MUST respond in JSON matching this JSON schema: \n\`\`\`json\n${outputSchema}\n\`\`\``,
  ].join("\n\n");
}

export function writeFinalReportPrompt({
  question,
  learnings,
}: {
  question: string;
  learnings: string[];
}) {
  const learningsString = learnings
    .map((learning) => `<learning>\n${learning}\n</learning>`)
    .join("\n");
  return [
    `Given the following question from the user, write a final report on the topic using the learnings from research. Make it as as detailed as possible, aim for 3 or more pages, include ALL the learnings from research:`,
    `<question>${question}</question>`,
    `Here are all the learnings from previous research:`,
    `<learnings>\n${learningsString}\n</learnings>`,
    `You need to write this report like a human researcher. Humans don not wrap their writing in markdown blocks.`,
  ].join("\n\n");
}
