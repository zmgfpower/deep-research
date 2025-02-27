"use client";
import { useState } from "react";
import { parsePartialJson } from "@ai-sdk/ui-utils";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Plimit from "p-limit";
import { LoaderCircle } from "lucide-react";
import {
  generateSerpQueries,
  reviewSerpQueries,
  writeFinalReport,
  getSERPQuerySchema,
} from "@/lib/deep-research";
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
import useAccurateTimer from "@/hooks/useAccurateTimer";
import { useTaskStore } from "@/store/task";
import { pick, flat } from "radash";

const formSchema = z.object({
  topic: z.string().min(2).max(200),
  numQuestions: z.number().int().positive().min(1).max(10),
  numLearnings: z.number().int().positive().min(1).max(10),
  numThoughts: z.number().int().positive().min(1).max(3),
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

// async function waiting() {
//   return new Promise((resolve) => setTimeout(() => resolve(true), 2000))
// }

function ResearchTopic() {
  const taskStore = useTaskStore();
  const {
    formattedTime,
    start: accurateTimerStart,
    stop: accurateTimerStop,
  } = useAccurateTimer();
  const [thinking, setThinking] = useState<boolean>(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: "",
      numQuestions: 5,
      numLearnings: 5,
      numThoughts: 2,
    },
  });

  async function runSearchTask(queries: SearchTask[]) {
    const { numLearnings } = useTaskStore.getState();
    const plimit = Plimit(1);
    for await (const item of queries) {
      await plimit(async () => {
        let content = "";
        const sources: Source[] = [];
        taskStore.updateTask(item.query, { state: "processing" });
        const searchResult = await processSearchResult({
          ...pick(item, ["query", "researchGoal"]),
          numLearnings,
        });
        for await (const part of searchResult.fullStream) {
          if (part.type === "text-delta") {
            content += part.textDelta;
            taskStore.updateTask(item.query, { learning: content });
          } else if (part.type === "reasoning") {
            console.log("reasoning", part.textDelta);
          } else if (part.type === "source") {
            sources.push(part.source);
          }
        }
        if (sources.length > 0) {
          taskStore.updateTask(item.query, { sources });
        }
        taskStore.updateTask(item.query, { state: "completed" });
        return content;
      });
    }
  }

  async function reviewSearchResult() {
    const { question, tasks, numQuestions } = useTaskStore.getState();
    const result = await reviewSerpQueries({
      question: question,
      learnings: tasks.map((item) => item.learning),
      numQueries: numQuestions,
    });

    const querySchema = getSERPQuerySchema();
    let content = "";
    let queries = [];
    for await (const textPart of result.textStream) {
      content += textPart;
      const data: PartialJson = parsePartialJson(removeJsonMarkdown(content));
      if (
        querySchema.safeParse(data.value) &&
        data.state === "successful-parse"
      ) {
        if (data.value.queries) {
          queries = data.value.queries.map(
            (item: { query: string; researchGoal: string }) => ({
              state: "unprocessed",
              learning: "",
              ...pick(item, ["query", "researchGoal"]),
            })
          );
        }
      }
    }
    if (queries.length > 0) {
      taskStore.update([...tasks, ...queries]);
      await runSearchTask(queries);
    }
  }

  async function handleWriteFinalReport() {
    const { question, tasks } = useTaskStore.getState();
    const result = await writeFinalReport({
      question: question,
      learnings: tasks.map((item) => item.learning),
    });
    let content = "";
    for await (const textPart of result.textStream) {
      content += textPart;
      taskStore.updateFinalReport(content);
    }
    const sources = flat(
      tasks.map((item) => (item.sources ? item.sources : []))
    );
    content += `## Sources\n\n${sources
      .map((source) => `- [${source.title || source.url}](${source.url})`)
      .join("\n")}`;
    taskStore.updateFinalReport(content);
  }

  async function deepResearch(values: z.infer<typeof formSchema>) {
    const { question, tasks } = useTaskStore.getState();

    if (values.topic === "") return null;
    taskStore.updateParams({
      ...pick(values, ["numQuestions", "numLearnings", "numThoughts"]),
    });

    setThinking(true);
    accurateTimerStart();
    try {
      let queries = [];
      if (values.topic !== question) {
        taskStore.updateQuestion(values.topic);
        const result = await generateSerpQueries({
          question: values.topic,
          numQueries: values.numQuestions,
        });

        const querySchema = getSERPQuerySchema();
        let content = "";
        for await (const textPart of result.textStream) {
          content += textPart;
          const data: PartialJson = parsePartialJson(
            removeJsonMarkdown(content)
          );
          if (querySchema.safeParse(data.value)) {
            if (
              data.state === "repaired-parse" ||
              data.state === "successful-parse"
            ) {
              if (data.value.queries) {
                queries = data.value.queries.map(
                  (item: { query: string; researchGoal: string }) => ({
                    state: "unprocessed",
                    learning: "",
                    ...pick(item, ["query", "researchGoal"]),
                  })
                );
                taskStore.update(queries);
              }
            }
          }
        }
      } else {
        // Continue with the previous research process
        queries = tasks.map((task) => task.state === "unprocessed");
      }
      await runSearchTask(queries);
      for (let i = 1; i < values.numThoughts; i++) {
        await reviewSearchResult();
      }
      await handleWriteFinalReport();
    } catch (err) {
      console.error(err);
    } finally {
      setThinking(false);
      accurateTimerStop();
    }
  }

  return (
    <section className="p-4 border rounded-md mt-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(deepResearch)}>
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
          <div className="grid grid-cols-3 gap-2 mt-2">
            <FormField
              control={form.control}
              name="numQuestions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of questions</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={10}
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
                      min={1}
                      max={10}
                      {...field}
                      {...form.register("numLearnings", {
                        valueAsNumber: true,
                      })}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="numThoughts"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of thoughts</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={3}
                      {...field}
                      {...form.register("numThoughts", {
                        valueAsNumber: true,
                      })}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <Button className="mt-4 w-full" type="submit">
            {thinking ? (
              <>
                <LoaderCircle className="animate-spin" /> Research...{" "}
                <small className="font-mono">{formattedTime}</small>
              </>
            ) : (
              "Start Research"
            )}
          </Button>
        </form>
      </Form>
    </section>
  );
}

export default ResearchTopic;
