"use client";
import { useState, useMemo, useLayoutEffect } from "react";
import { useTranslation } from "react-i18next";
import { TrashIcon, FileOutput } from "lucide-react";
import Fuse from "fuse.js";
import dayjs from "dayjs";
import SearchArea from "@/components/Internal/SearchArea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTaskStore } from "@/store/task";
import { useHistoryStore, type ResearchHistory } from "@/store/history";

interface HistoryProps {
  open: boolean;
  onClose: () => void;
}

const PAGE_SIZE = 20;

function formatDate(timestamp: number) {
  return dayjs(timestamp).format("YYYY-MM-DD HH:mm");
}

function History({ open, onClose }: HistoryProps) {
  const { t } = useTranslation();
  const { backup, restore, reset } = useTaskStore();
  const { history, load, update, remove } = useHistoryStore();
  const [historyList, setHistoryList] = useState<ResearchHistory[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const showLoadMore = useMemo(() => {
    return history.length > currentPage * PAGE_SIZE;
  }, [history, currentPage]);

  async function loadHistory(id: string) {
    const { id: currentId } = useTaskStore.getState();
    const data = load(id);
    if (currentId) update(currentId, backup());
    if (data) {
      reset();
      restore(data);
    }
    onClose();
  }

  async function removeHistory(id: string) {
    remove(id);
  }

  function handleSearch(value: string) {
    const options = { keys: ["question", "finalReport"] };
    const knowledgeIndex = Fuse.createIndex(options.keys, history);
    const fuse = new Fuse(history, options, knowledgeIndex);
    const result = fuse.search(value);
    setHistoryList(result.map((value) => value.item));
  }

  function handleClose(open: boolean) {
    if (!open) onClose();
  }

  async function loadMore() {
    const nextPage = currentPage + 1;
    const total = nextPage * PAGE_SIZE;
    setHistoryList(history.slice(0, total));
    setCurrentPage(nextPage);
  }

  useLayoutEffect(() => {
    setHistoryList(history.slice(0, PAGE_SIZE));
  }, [history]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-lg:max-w-screen-sm max-w-screen-md gap-2">
        <DialogHeader>
          <DialogTitle>{t("history.title")}</DialogTitle>
          <DialogDescription>{t("history.description")}</DialogDescription>
        </DialogHeader>
        <div className="flex justify-end">
          <SearchArea
            onChange={handleSearch}
            onClear={() => setHistoryList(history.slice(0, PAGE_SIZE))}
          />
        </div>
        <ScrollArea className="max-h-[65vh]">
          {historyList.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              {t("history.noHistory")}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("history.name")}</TableHead>
                    <TableHead className="text-center max-sm:hidden">
                      {t("history.date")}
                    </TableHead>
                    <TableHead className="text-center w-28">
                      {t("history.actions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historyList.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <p
                          className="truncate w-96 max-lg:max-w-72 max-sm:max-w-52 cursor-pointer hover:text-blue-500"
                          title={item.title}
                          onClick={() => loadHistory(item.id)}
                        >
                          {item.title || item.question}
                        </p>
                      </TableCell>
                      <TableCell className="text-center whitespace-nowrap max-sm:hidden">
                        {formatDate(item.updatedAt || item.createdAt)}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            title={t("history.load")}
                            onClick={() => loadHistory(item.id)}
                          >
                            <FileOutput className="h-4 w-4" />
                          </Button>
                          <Button
                            className="text-red-500 hover:text-red-600"
                            variant="ghost"
                            size="icon"
                            title={t("history.delete")}
                            onClick={() => removeHistory(item.id)}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div
                className={
                  showLoadMore
                    ? "text-center cursor-pointer text-sm hover:underline underline-offset-4"
                    : "hidden"
                }
                onClick={() => loadMore()}
              >
                {t("history.loadMore")}
              </div>
            </>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export default History;
