import { LoaderCircle, CircleCheck, TextSearch } from "lucide-react";
import Magicdown from "@/components/Magicdown";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useTaskStore } from "@/store/task";
import { cn } from "@/utils/style";

function TaskState({ state }: { state: SearchTask["state"] }) {
  if (state === "completed") {
    return <CircleCheck className="h-5 w-5" />;
  } else if (state === "processing") {
    return <LoaderCircle className="animate-spin h-5 w-5" />;
  } else {
    return <TextSearch className="h-5 w-5" />;
  }
}

function ResearchResult() {
  const taskStore = useTaskStore();

  return (
    <section
      className={cn("p-4 border rounded-md mt-4", {
        hidden: taskStore.tasks.length === 0,
      })}
    >
      <h3 className="font-semibold text-lg border-b mb-2 leading-10">
        Research Result
      </h3>
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
                  {item.learning +
                    (item.sources
                      ? `#### Sources\n\n${item.sources
                          .map(
                            (source) =>
                              `- [${source.title || source.url}](${source.url})`
                          )
                          .join("\n")}`
                      : "")}
                </Magicdown>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </section>
  );
}

export default ResearchResult;
