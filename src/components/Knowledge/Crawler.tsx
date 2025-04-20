"use client";
import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTaskStore } from "@/store/task";
import { useKnowledgeStore } from "@/store/knowledge";
import { generateFileId, getTextByteSize } from "@/utils/file";
import { omit } from "radash";

type Props = {
  open: boolean;
  onClose: () => void;
};

interface ReaderResult {
  code: number;
  status: number;
  data: {
    warning?: string;
    title: string;
    description: string;
    url: string;
    content: string;
    usage: {
      tokens: number;
    };
  };
}

const URLRegExp = /^https?:\/\/.+/;

async function jinaReader(url = "") {
  const response = await fetch("https://r.jina.ai", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url }),
  });
  const result: ReaderResult = await response.json();
  if (result.data.warning) {
    toast.error(result.data.warning);
  }
  return omit(result.data, ["usage", "description"]);
}

const formSchema = z.object({
  url: z.string(),
  crawler: z.string(),
});

function Crawler({ open, onClose }: Props) {
  const [isFetching, setIsFetching] = useState<boolean>(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "",
      crawler: "jina",
    },
  });

  async function fetchPageContent(url: string, crawler: string) {
    const { exist, save } = useKnowledgeStore.getState();
    const { addResource } = useTaskStore.getState();

    if (crawler === "jina") {
      const result = await jinaReader(url);
      if (result.warning) return "";

      const currentTime = Date.now();
      const fileMeta: FileMeta = {
        name: result.title,
        size: getTextByteSize(result.content),
        type: "text/plain",
        lastModified: currentTime,
      };
      const id = generateFileId(fileMeta);
      if (!exist(id)) {
        save({
          id,
          title: result.title,
          content: result.content,
          fileMeta,
          createdAt: currentTime,
          updatedAt: currentTime,
        });
        addResource({
          ...omit(fileMeta, ["lastModified"]),
          id,
          from: "url",
          status: "completed",
        });
      } else {
        addResource({
          ...omit(fileMeta, ["lastModified"]),
          id,
          from: "knowledge",
          status: "completed",
        });
      }
      toast.message(
        `The page content of "${url}" has been added to the resource.`
      );
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { url, crawler } = values;
    if (URLRegExp.test(url)) {
      setIsFetching(true);
      await fetchPageContent(url, crawler);
      setIsFetching(false);
    } else {
      toast.error("Please enter a valid URL");
    }
  }

  function handleClose(open: boolean) {
    if (!open) onClose();
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Web Crawler</DialogTitle>
          <DialogDescription>
            The web crawler obtains the page content of the specified URL
            through server and returns the data in markdown format.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Please enter the URL" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter className="flex sm:justify-between">
              <FormField
                control={form.control}
                name="crawler"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Select {...field} onValueChange={field.onChange}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="proxy">Proxy</SelectItem>
                          <SelectItem value="jina">Jina Reader</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="inline-flex gap-2">
                <Button type="reset" variant="secondary">
                  Clear
                </Button>
                <Button type="submit" disabled={isFetching}>
                  <span>Fetch</span>
                  {isFetching ? (
                    <LoaderCircle className="animate-spin ml-1" />
                  ) : null}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default Crawler;
