"use client";
import dynamic from "next/dynamic";
import { useState } from "react";
// import { useTranslation } from "react-i18next";
import { TrashIcon, FilePenLine } from "lucide-react";
import dayjs from "dayjs";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogContent,
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
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useKnowledgeStore } from "@/store/knowledge";

const Content = dynamic(() => import("./Content"));

interface KnowledgeProps {
  open: boolean;
  onClose: () => void;
}

function formatDate(timestamp: number) {
  return dayjs(timestamp).format("YYYY-MM-DD HH:mm");
}

function Knowledge({ open, onClose }: KnowledgeProps) {
  // const { t } = useTranslation();
  const { knowledges, remove } = useKnowledgeStore();
  const [tab, setTab] = useState<"list" | "edit">("list");
  const [currendId, setCurrentId] = useState<string>("");

  async function editKnowledge(id: string) {
    setCurrentId(id);
    setTab("edit");
  }

  async function removeKnowledge(id: string) {
    remove(id);
  }

  function handleBack() {
    setCurrentId("");
    setTab("list");
  }

  function handleClose(open: boolean) {
    if (!open) onClose();
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-screen-sm gap-2">
        <DialogHeader>
          <DialogTitle>Knowledge Base</DialogTitle>
          <DialogDescription>
            A knowledge base stored locally in the browser.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[90vh] overflow-y-auto">
          <Tabs value={tab} className="w-full">
            <TabsContent value="list">
              {knowledges.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  Empty
                </div>
              ) : (
                <Table className="max-sm:overflow-y-auto">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead className="text-center">Date</TableHead>
                      <TableHead className="text-center w-32">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {knowledges.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <p
                            className="truncate w-72 cursor-pointer hover:text-blue-500"
                            title={item.title}
                            onClick={() => editKnowledge(item.id)}
                          >
                            {item.title}
                          </p>
                        </TableCell>
                        <TableCell className="text-center whitespace-nowrap">
                          {formatDate(item.updatedAt || item.createdAt)}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Edit"
                              onClick={() => editKnowledge(item.id)}
                            >
                              <FilePenLine className="h-4 w-4" />
                            </Button>
                            <Button
                              className="text-red-500 hover:text-red-600"
                              variant="ghost"
                              size="icon"
                              title="Delete"
                              onClick={() => removeKnowledge(item.id)}
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
            </TabsContent>
            <TabsContent value="edit">
              <Content
                id={currendId}
                editClassName="h-80 overflow-y-auto rounded-md border p-1 text-sm"
                onBack={() => handleBack()}
              ></Content>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default Knowledge;
