"use client";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { LoaderCircle } from "lucide-react";
import Magicdown from "@/components/Magicdown";
import { Button } from "@/components/ui/button";
import useDeepResearch from "@/hooks/useDeepResearch";
import { useTaskStore } from "@/store/task";
import { downloadFile } from "@/utils/file";

function FinalReport() {
  const { t } = useTranslation();
  const taskStore = useTaskStore();
  const { writeFinalReport } = useDeepResearch();
  const [isThinking, setIsThinking] = useState<boolean>(false);

  async function handleWriteFinalReport() {
    setIsThinking(true);
    writeFinalReport();
    setIsThinking(false);
  }

  async function handleDownloadPDF() {
    const { default: printJS } = await import("print-js");
    printJS({
      printable: "final-report",
      type: "html",
      header: taskStore.question,
    });
  }

  return (
    <section className="p-4 border rounded-md mt-4">
      <h3 className="font-semibold text-lg border-b mb-2 leading-10">
        {t("research.finalReport.title")}
      </h3>
      {taskStore.finalReport === "" ? (
        <div>{t("research.finalReport.emptyTip")}</div>
      ) : (
        <>
          <article
            id="final-report"
            className="prose prose-slate dark:prose-invert mt-6"
          >
            <Magicdown>{taskStore.finalReport}</Magicdown>
          </article>
          <div className="flex gap-4 max-sm:gap-2 w-full border-t mt-4 pt-4">
            <Button
              className="w-full"
              variant="secondary"
              disabled={isThinking}
              onClick={() => handleWriteFinalReport()}
            >
              {isThinking ? (
                <>
                  <LoaderCircle className="animate-spin" />
                  {t("research.common.writingReport")}
                </>
              ) : (
                t("research.common.rewriteReport")
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
              Markdown
            </Button>
            <Button className="w-full" onClick={() => handleDownloadPDF()}>
              PDF
            </Button>
          </div>
        </>
      )}
    </section>
  );
}

export default FinalReport;
