import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import Magicdown from "@/components/Magicdown";
import { Button } from "@/components/ui/button";
import { writeFinalReport } from "@/lib/deep-research";
import { useTaskStore } from "@/store/task";
import { downloadFile } from "@/utils/file";
import { cn } from "@/utils/style";
import { flat } from "radash";

function FinalReport() {
  const taskStore = useTaskStore();
  const [thinking, setThinking] = useState<boolean>(false);

  async function handleWriteFinalReport() {
    const { question, tasks } = useTaskStore.getState();
    setThinking(true);
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
    content += `---\n\n${sources
      .map(
        (source, idx) =>
          `${idx}. [${source.title || source.url}](${source.url})`
      )
      .join("\n")}`;
    taskStore.updateFinalReport(content);
    setThinking(false);
  }

  return (
    <section
      className={cn("p-4 border rounded-md mt-4", {
        hidden: taskStore.finalReport === "",
      })}
    >
      <h3 className="font-semibold text-lg">Final Report</h3>
      <div className="prose border-b mb-2">
        <Magicdown>{taskStore.finalReport}</Magicdown>
      </div>
      <div className="flex gap-2 w-full">
        <Button
          className="w-full"
          variant="secondary"
          onClick={() => handleWriteFinalReport()}
        >
          {thinking ? (
            <>
              <LoaderCircle className="animate-spin" />
              Writing Report
            </>
          ) : (
            "Rewrite Report"
          )}
        </Button>
        <Button
          className="w-full"
          onClick={() =>
            downloadFile(
              taskStore.finalReport,
              taskStore.question,
              "text/markdown"
            )
          }
        >
          DownLoad
        </Button>
      </div>
    </section>
  );
}

export default FinalReport;
