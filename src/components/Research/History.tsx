"use client";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { 
  TrashIcon, 
  ArrowLeftIcon, 
  LoaderCircle
} from "lucide-react";
import { format } from "date-fns";
import { zhCN, enUS } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../ui/table";
import { useTaskStore } from "@/store/task";
import { useSettingStore } from "@/store/setting";

interface HistoryDialogProps {
  open: boolean;
  onClose: () => void;
}

export function HistoryDialog({ open, onClose }: HistoryDialogProps) {
  const { t } = useTranslation();
  const { language } = useSettingStore();
  const { history, loadFromHistory, deleteHistory } = useTaskStore();
  const [loading, setLoading] = useState(false);

  const handleLoadHistory = async (historyId: string) => {
    setLoading(true);
    loadFromHistory(historyId);
    setLoading(false);
    onClose();
  };

  const handleDeleteHistory = (historyId: string) => {
    deleteHistory(historyId);
  };

  const getDateLocale = () => {
    return language === "zh-CN" ? zhCN : enUS;
  };

  const formatDate = (timestamp: number) => {
    return format(
      new Date(timestamp), 
      "yyyy-MM-dd HH:mm", 
      { locale: getDateLocale() }
    );
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t("research.history.title")}</DialogTitle>
        </DialogHeader>
        <div className="max-h-[400px] overflow-y-auto">
          {history.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              {t("research.history.noHistory")}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("research.history.title")}</TableHead>
                  <TableHead>{t("research.history.date")}</TableHead>
                  <TableHead className="w-[120px]">{t("research.history.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Button
                        variant="link"
                        className="p-0 h-auto text-left font-normal"
                        onClick={() => handleLoadHistory(item.id)}
                      >
                        {item.title || item.question.slice(0, 30)}
                      </Button>
                    </TableCell>
                    <TableCell>{formatDate(item.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={loading}
                          onClick={() => handleLoadHistory(item.id)}
                        >
                          {loading ? (
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                          ) : (
                            <ArrowLeftIcon className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteHistory(item.id)}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            {t("research.history.close")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 