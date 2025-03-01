"use client";
import { useTranslation } from "react-i18next";
import { LoaderCircle, CircleCheck, TextSearch } from "lucide-react";
import Magicdown from "@/components/Magicdown";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useTaskStore } from "@/store/task";

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

  return (
    <section className="p-4 border rounded-md mt-4">
      <h3 className="font-semibold text-lg border-b mb-2 leading-10">
        {t("research.searchResult.title")}
      </h3>
      {taskStore.tasks.length === 0 ? (
        <div>{t("research.searchResult.emptyTip")}</div>
      ) : (
        <Accordion type="single" collapsible>
          {taskStore.tasks.map((item, idx) => {
            return (
              <AccordionItem key={idx} value={item.query}>
                <AccordionTrigger>
                  <div className="flex">
                    <TaskState state={item.state} />
                    <span className="ml-1">{item.query}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="prose prose-slate dark:prose-invert">
                  <Magicdown>
                    {[
                      `> ${item.researchGoal}`,
                      item.learning,
                      item.sources?.length > 0
                        ? `\n\n#### ${t(
                            "research.common.sources"
                          )}\n\n${item.sources
                            .map(
                              (source) =>
                                `- [${source.title || source.url}](${
                                  source.url
                                })`
                            )
                            .join("\n")}`
                        : "",
                    ].join("\n\n")}
                  </Magicdown>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}
    </section>
  );
}

export default SearchResult;
