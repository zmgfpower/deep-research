"use client";
import { useState } from "react";
import { streamText, smoothStream } from "ai";
import { LoaderCircle } from "lucide-react";
import Magicdown from "@/components/Magicdown";
import { Button } from "@/components/ui/button";
import { writeFinalReportPrompt } from "@/lib/deep-research";
import { systemPrompt } from "@/lib/deep-research/prompt";
import { useGoogleProvider } from "@/hooks/useAiProvider";
import { useTaskStore } from "@/store/task";
import { downloadFile } from "@/utils/file";
import { cn } from "@/utils/style";
import { flat } from "radash";

function FinalReport() {
  const taskStore = useTaskStore();
  const google = useGoogleProvider();
  const [thinking, setThinking] = useState<boolean>(false);

  async function handleWriteFinalReport() {
    const { question, tasks } = useTaskStore.getState();
    setThinking(true);
    const result = streamText({
      model: google("gemini-2.0-flash-thinking-exp"),
      system: systemPrompt(),
      prompt: writeFinalReportPrompt({
        question: question,
        learnings: tasks.map((item) => item.learning),
      }),
      experimental_transform: smoothStream(),
    });
    let content = "";
    for await (const textPart of result.textStream) {
      content += textPart;
      taskStore.updateFinalReport(content);
    }
    const sources = flat(
      tasks.map((item) => (item.sources ? item.sources : []))
    );
    if (sources.length > 0) {
      content += `## Researched ${sources.length} websites\n\n${sources
        .map(
          (source, idx) =>
            `${idx + 1}. [${source.title || source.url}](${source.url})`
        )
        .join("\n")}`;
    }
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
