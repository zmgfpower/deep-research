"use client";
import { useState } from "react";
import { parsePartialJson } from "@ai-sdk/ui-utils";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Plimit from "p-limit";
import { LoaderCircle } from "lucide-react";
import { generateSerpQueries, getSERPQuerySchema } from "@/lib/deep-research";
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
import { processSearchResult } from "@/lib/deep-research";
import { useTaskStore } from "@/store/task";
import { pick } from "radash";

const formSchema = z.object({
  topic: z.string().min(2).max(200),
  numQuestions: z.number().int().positive().min(1).max(10),
  numLearnings: z.number().int().positive().min(1).max(5),
});

function removeJsonMarkdown(text: string) {
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

function ResearchTopic() {
  const taskStore = useTaskStore();
  const [thinking, setThinking] = useState<boolean>(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: "",
      numQuestions: 5,
      numLearnings: 5,
    },
  });

  async function handleSubmit(values: z.infer<typeof formSchema>) {
    if (values.topic === "") return null;
    setThinking(true);
    taskStore.updateQuestion(values.topic);
    const result = await generateSerpQueries({
      query: values.topic,
      numQueries: values.numQuestions,
    });
    let content = "";
    const querySchema = getSERPQuerySchema();
    for await (const textPart of result.textStream) {
      content += textPart;
      const data: PartialJson = parsePartialJson(removeJsonMarkdown(content));
      if (querySchema.safeParse(data.value)) {
        if (
          data.state === "repaired-parse" ||
          data.state === "successful-parse"
        ) {
          taskStore.update(
            data.value.queries.map(
              (item: { query: string; researchGoal: string }) => ({
                state: "unprocessed",
                learning: "",
                ...pick(item, ["query", "researchGoal"]),
              })
            )
          );
        }
        if (data.state === "successful-parse") {
          const plimit = Plimit(1);

          for await (const item of data.value.queries) {
            await plimit(async () => {
              let content = "";
              taskStore.updateTask(item.query, { state: "processing" });
              const searchResult = await processSearchResult({
                ...pick(item, ["query", "researchGoal"]),
              });
              for await (const textPart of searchResult.textStream) {
                content += textPart;
                taskStore.updateTask(item.query, {
                  state: "processing",
                  learning: content,
                });
              }
              taskStore.updateTask(item.query, { state: "completed" });
              return content;
            });
          }
        }
      }
    }
    setThinking(false);
  }

  return (
    <section className="p-4 border rounded-md mt-6">
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
                    <Input
                      type="number"
                      {...field}
                      {...form.register("numQuestions", {
                        valueAsNumber: true,
                      })}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="numLearnings"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of learnings</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      {...form.register("numLearnings", {
                        valueAsNumber: true,
                      })}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <Button className="mt-4" type="submit">
            {thinking ? (
              <>
                <LoaderCircle className="animate-spin" /> Research...
              </>
            ) : (
              <>Start Research</>
            )}
          </Button>
        </form>
      </Form>
    </section>
  );
}

export default ResearchTopic;
