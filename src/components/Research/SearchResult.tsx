"use client";
import { useState, useEffect, useLayoutEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, CircleCheck, TextSearch } from "lucide-react";
import { Crepe } from "@milkdown/crepe";
import { replaceAll, getHTML } from "@milkdown/kit/utils";
import MilkdownEditor from "@/components/MilkdownEditor";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import useAccurateTimer from "@/hooks/useAccurateTimer";
import useDeepResearch from "@/hooks/useDeepResearch";
import { useTaskStore } from "@/store/task";

const formSchema = z.object({
  suggestion: z.string(),
});

function TaskState({ state }: { state: SearchTask["state"] }) {
  if (state === "completed") {
    return <CircleCheck className="h-5 w-5" />;
  } else if (state === "processing") {
    return <LoaderCircle className="animate-spin h-5 w-5" />;
  } else {
    return <TextSearch className="h-5 w-5" />;
  }
}

function SearchResult() {
  const { t } = useTranslation();
  const taskStore = useTaskStore();
  const { status, reviewSearchResult, writeFinalReport } = useDeepResearch();
  const {
    formattedTime,
    start: accurateTimerStart,
    stop: accurateTimerStop,
  } = useAccurateTimer();
  const [mlkdownEditor, setMilkdownEditor] = useState<Crepe>();
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [isWriting, setIsWriting] = useState<boolean>(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      suggestion: taskStore.suggestion,
    },
  });

  useEffect(() => {
    form.setValue("suggestion", taskStore.suggestion);
  }, [taskStore.suggestion, form]);

  async function handleWriteFinalReport() {
    try {
      accurateTimerStart();
      setIsWriting(true);
      await writeFinalReport();
      setIsWriting(false);
    } finally {
      accurateTimerStop();
    }
  }

  function renderMarkdown(markdown: string) {
    if (mlkdownEditor) {
      replaceAll(markdown)(mlkdownEditor.editor.ctx);
      const html = getHTML()(mlkdownEditor.editor.ctx);
      return (
        <blockquote className="hidden-empty-p">
          <div
            dangerouslySetInnerHTML={{
              __html: html,
            }}
          ></div>
        </blockquote>
      );
    }
    return null;
  }

  async function handleSubmit(values: z.infer<typeof formSchema>) {
    const { setSuggestion } = useTaskStore.getState();
    setSuggestion(values.suggestion);
    try {
      accurateTimerStart();
      setIsThinking(true);
      await reviewSearchResult();
      // Clear previous research suggestions
      setSuggestion("");
      setIsThinking(false);
    } finally {
      accurateTimerStop();
    }
  }

  useLayoutEffect(() => {
    const crepe = new Crepe({
      defaultValue: "",
      root: document.createDocumentFragment(),
      features: {
        [Crepe.Feature.ImageBlock]: false,
        [Crepe.Feature.BlockEdit]: false,
        [Crepe.Feature.Toolbar]: false,
        [Crepe.Feature.LinkTooltip]: false,
      },
    });

    crepe.setReadonly(true).create();
    setMilkdownEditor(crepe);

    return () => {
      crepe.destroy();
    };
  }, []);

  return (
    <section className="p-4 border rounded-md mt-4">
      <h3 className="font-semibold text-lg border-b mb-2 leading-10">
        {t("research.searchResult.title")}
      </h3>
      {taskStore.tasks.length === 0 ? (
        <div>{t("research.searchResult.emptyTip")}</div>
      ) : (
        <div>
          <Accordion className="mb-4" type="single" collapsible>
            {taskStore.tasks.map((item, idx) => {
              return (
                <AccordionItem key={idx} value={item.query}>
                  <AccordionTrigger>
                    <div className="flex">
                      <TaskState state={item.state} />
                      <span className="ml-1">{item.query}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="prose prose-slate dark:prose-invert max-w-full min-h-20">
                    {renderMarkdown(item.researchGoal)}
                    <MilkdownEditor
                      value={item.learning}
                      onChange={(value) =>
                        taskStore.updateTask(item.query, { learning: value })
                      }
                    ></MilkdownEditor>
                    {item.sources?.length > 0 ? (
                      <>
                        <hr className="my-6" />
                        <h4>{t("research.common.sources")}</h4>
                        <ol>
                          {item.sources.map((source, idx) => {
                            return (
                              <li key={idx}>
                                <a href={source.url} target="_blank">
                                  {source.title || source.url}
                                </a>
                              </li>
                            );
                          })}
                        </ol>
                      </>
                    ) : null}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
              <FormField
                control={form.control}
                name="suggestion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="mb-2 font-semibold">
                      {t("research.searchResult.suggestionLabel")}
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder={t(
                          "research.searchResult.suggestionPlaceholder"
                        )}
                        disabled={isThinking}
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4 max-sm:gap-2 w-full mt-4">
                <Button type="submit" variant="secondary" disabled={isThinking}>
                  {isThinking ? (
                    <>
                      <LoaderCircle className="animate-spin" />
                      <span className="mx-1">{status}</span>
                      <small className="font-mono">{formattedTime}</small>
                    </>
                  ) : (
                    t("research.common.continueResearch")
                  )}
                </Button>
                <Button
                  disabled={isWriting}
                  onClick={() => handleWriteFinalReport()}
                >
                  {isWriting ? (
                    <>
                      <LoaderCircle className="animate-spin" />
                      <span className="mx-1">{status}</span>
                      <small className="font-mono">{formattedTime}</small>
                    </>
                  ) : (
                    t("research.common.writeReport")
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      )}
    </section>
  );
}

export default SearchResult;
