"use client";
import { useMemo } from "react";
import dayjs from "dayjs";
import Content from "./Content";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useKnowledgeStore } from "@/store/knowledge";
import { formatSize } from "@/utils/file";

type Props = {
  id: string;
  open: boolean;
  onClose: () => void;
};

function formatDate(timestamp: number) {
  return dayjs(timestamp).format("YYYY-MM-DD HH:mm");
}

function KnowledgeInfor({ id }: { id: string }) {
  const knowledge = useMemo(() => {
    const { knowledges } = useKnowledgeStore.getState();
    const detail = knowledges.find((item) => item.id === id);
    return detail;
  }, [id]);
  if (knowledge) {
    if (knowledge.type === "file" && knowledge.fileMeta) {
      const fileSize = formatSize(knowledge.fileMeta.size);
      return `The file name is "${knowledge.fileMeta.name}", the type is 
          "${knowledge.fileMeta.type}", and the size is "${fileSize}".
          Uploaded by user at ${formatDate(knowledge.createdAt)}`;
    } else if (knowledge.type === "url" && knowledge.url) {
      return `Fetch from "${knowledge.url}" at ${formatDate(
        knowledge.createdAt
      )}`;
    } else {
      return `Created by user at ${formatDate(knowledge.createdAt)}`;
    }
  }
  return null;
}

function Resource({ id, open, onClose }: Props) {
  function handleClose(open: boolean) {
    if (!open) onClose();
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-screen-sm gap-2">
        <DialogHeader>
          <DialogTitle>Resource</DialogTitle>
          <DialogDescription>
            <KnowledgeInfor id={id} />
          </DialogDescription>
        </DialogHeader>
        <Content
          id={id}
          editClassName="h-72 overflow-y-auto rounded-md border p-1 text-sm"
        ></Content>
      </DialogContent>
    </Dialog>
  );
}

export default Resource;
