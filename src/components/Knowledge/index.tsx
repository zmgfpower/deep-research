"use client";
import dynamic from "next/dynamic";
import { useState } from "react";
// import { useTranslation } from "react-i18next";
import { TrashIcon, FilePenLine, FilePlus2 } from "lucide-react";
import { toast } from "sonner";
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
import { useTaskStore } from "@/store/task";
import { omit } from "radash";

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
  const { knowledges, save, remove } = useKnowledgeStore();
  const [tab, setTab] = useState<"list" | "edit">("list");
  const [currentId, setCurrentId] = useState<string>("");

  function createnowledge() {
    const currentTime = Date.now();
    const id = `TEMPORARY_${currentTime}`;
    save({
      id,
      title: "",
      content: "",
      fileMeta: {
        name: "",
        size: 0,
        type: "text/plain",
        lastModified: currentTime,
      },
      createdAt: currentTime,
      updatedAt: currentTime,
    });
    setCurrentId(id);
    setTab("edit");
  }

  function addToResources(id: string) {
    const { addResource } = useTaskStore.getState();
    const knowledge = knowledges.find((item) => item.id === id);
    if (knowledge) {
      addResource({
        ...omit(knowledge.fileMeta, ["lastModified"]),
        id,
        from: "knowledge",
        status: "completed",
      });
      toast.message(`${knowledge.title} has been added to the resource.`);
    } else {
      console.error("Resource not found");
    }
  }

  function editKnowledge(id: string) {
    setCurrentId(id);
    setTab("edit");
  }

  function removeKnowledge(id: string) {
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
              <div>
                <Button
                  variant="secondary"
                  title="Create Knowledge"
                  onClick={() => createnowledge()}
                >
                  Create Knowledge
                </Button>
              </div>
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
                      <TableHead className="text-center w-40">Action</TableHead>
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
                              title="Add"
                              onClick={() => addToResources(item.id)}
                            >
                              <FilePlus2 className="h-4 w-4" />
                            </Button>
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
                id={currentId}
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
