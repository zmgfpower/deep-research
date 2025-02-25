"use client";
import { generateText } from "ai";
import { useForm } from "react-hook-form";
import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { google } from "@/lib/ai/providers";
import { systemPrompt } from "@/utils/prompt";
import { markdownCodeBlockToJson } from "@/utils/markdown";

const formSchema = z.object({
  topic: z.string().min(2).max(200),
  numQuestions: z.number().min(1).max(8),
  depth: z.number().min(1).max(5),
});

async function generateSerpQueries({
  query,
  numQueries = 5,
  learnings,
}: {
  query: string;
  numQueries?: number;
  // optional, if provided, the research will continue from the last learning
  learnings?: string[];
}) {
  const outputSchema = zodToJsonSchema(
    z.object({
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
    })
  );

  const prompt = [
    `Given the following prompt from the user, generate a list of SERP queries to research the topic. Return a maximum of ${numQueries} queries, but feel free to return less if the original prompt is clear. Make sure each query is unique and not similar to each other: <prompt>${query}</prompt>\n\n`,
    learnings
      ? `Here are some learnings from previous research, use them to generate more specific queries: ${learnings.join(
          "\n"
        )}`
      : "",
    `You MUST respond in JSON matching this JSON schema: \n${JSON.stringify(
      outputSchema
    )}`,
  ].join("\n\n");

  return generateText({
    model: google("models/gemini-2.0-flash-thinking-exp"),
    system: systemPrompt(),
    prompt,
  });
}

function ResearchTopic({
  onResult,
}: {
  onResult: (queries: SearchQueries) => void;
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: "",
      numQuestions: 5,
      depth: 2,
    },
  });

  async function handleSubmit(values: z.infer<typeof formSchema>) {
    const result = await generateSerpQueries({
      query: values.topic,
      numQueries: values.numQuestions,
    });
    const queries = markdownCodeBlockToJson(result.text);
    if (queries) {
      onResult(queries);
    } else {
      console.error("JSON Parsing failed");
    }
  }

  return (
    <section className="p-4 border rounded-md mt-10">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <FormField
            control={form.control}
            name="topic"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="mb-2 font-semibold">
                  Research topics
                </FormLabel>
                <FormControl>
                  <Textarea
                    rows={3}
                    placeholder="Any questions you want to know..."
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-2 mt-2">
            <FormField
              control={form.control}
              name="numQuestions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of questions</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="depth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Depth</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <Button className="mt-4" type="submit">
            Submit
          </Button>
        </form>
      </Form>
    </section>
  );
}

export default ResearchTopic;
