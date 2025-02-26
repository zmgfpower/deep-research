import Magicdown from "@/components/Magicdown";
import { Button } from "@/components/ui/button";
import { writeFinalReport } from "@/lib/deep-research";
import { useTaskStore } from "@/store/task";
import { cn } from "@/utils/style";

function SearchResult() {
  const taskStore = useTaskStore();

  const handleWriteFinalReport = async () => {
    const result = await writeFinalReport({
      question: taskStore.question,
      learnings: taskStore.tasks.map((item) => item.learning),
    });
    let content = "";
    for await (const textPart of result.textStream) {
      content += textPart;
    }
    taskStore.updateFinalReport(content);
  };

  return (
    <section
      className={cn("p-4 border rounded-md mt-6", {
        hidden: taskStore.tasks.length === 0,
      })}
    >
      <h3 className="font-semibold text-lg">Search Result</h3>
      {taskStore.tasks.map((item, idx) => {
        return (
          <div key={idx} className={item.learning === "" ? "hidden" : ""}>
            <h4 className="font-semibold text-base border-b leading-10">
              {item.query}
            </h4>
            <div className="prose">
              <Magicdown>{item.learning}</Magicdown>
            </div>
          </div>
        );
      })}
      <Button type="button" onClick={() => handleWriteFinalReport()}>
        Write Report
      </Button>
    </section>
  );
}

export default SearchResult;
