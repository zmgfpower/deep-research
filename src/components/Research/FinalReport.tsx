"use client";
import { useTranslation } from "react-i18next";
import { Download, FileText, Signature } from "lucide-react";
import MilkdownEditor from "@/components/MilkdownEditor";
import Artifact from "@/components/Artifact";
import { Button } from "@/components/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { useTaskStore } from "@/store/task";
import { getSystemPrompt } from "@/utils/deep-research";
import { downloadFile } from "@/utils/file";

function FinalReport() {
  const { t } = useTranslation();
  const taskStore = useTaskStore();

  async function handleDownloadPDF() {
    const { default: printJS } = await import("print-js");
    printJS({
      printable: "final-report",
      type: "html",
      documentTitle: taskStore.title,
      targetStyles: ["prose", "max-w-full"],
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
          <article id="final-report">
            <MilkdownEditor
              className="prose prose-slate dark:prose-invert max-w-full min-h-72"
              value={taskStore.finalReport}
              onChange={(value) => taskStore.updateFinalReport(value)}
              tools={
                <>
                  <div className="px-1">
                    <Separator className="dark:bg-slate-700" />
                  </div>
                  <Artifact
                    value={taskStore.finalReport}
                    systemInstruction={getSystemPrompt()}
                    onChange={taskStore.updateFinalReport}
                    buttonClassName="float-menu-button"
                    dropdownMenuSideOffset={8}
                    tooltipSideOffset={8}
                  />
                  <div className="px-1">
                    <Separator className="dark:bg-slate-700" />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        className="float-menu-button"
                        type="button"
                        size="icon"
                        variant="ghost"
                        title="Export"
                        side="left"
                        sideoffset={8}
                      >
                        <Download />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="left" sideOffset={8}>
                      <DropdownMenuItem
                        onClick={() =>
                          downloadFile(
                            taskStore.finalReport,
                            taskStore.title,
                            "text/markdown;charset=utf-8"
                          )
                        }
                      >
                        <FileText />
                        <span>Markdown</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDownloadPDF()}>
                        <Signature />
                        <span>PDF</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              }
            />
          </article>
        </>
      )}
    </section>
  );
}

export default FinalReport;
