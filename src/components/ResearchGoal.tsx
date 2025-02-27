import { MessageCircleQuestion } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useTaskStore } from "@/store/task";
import { cn } from "@/utils/style";

function ResearchGoal() {
  const taskStore = useTaskStore();

  return (
    <section
      className={cn("p-4 border rounded-md mt-4", {
        hidden: taskStore.tasks.length === 0,
      })}
    >
      <h3 className="font-semibold text-lg">Research Goal</h3>
      <Accordion type="single" collapsible>
        {taskStore.tasks.map((item, idx) => {
          return (
            <AccordionItem key={idx} value={item.query}>
              <AccordionTrigger>
                <div className="flex">
                  <MessageCircleQuestion className="w-5 h-5" />
                  <span className="ml-1">{item.query}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>{item.researchGoal}</AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </section>
  );
}

export default ResearchGoal;
