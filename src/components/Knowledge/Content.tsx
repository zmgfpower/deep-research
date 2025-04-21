"use client";
import { useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import MagicDownEditor from "@/components/MagicDown/Editor";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useKnowledgeStore } from "@/store/knowledge";
import { cn } from "@/utils/style";

type Props = {
  id: string;
  editClassName?: string;
  onBack?: () => void;
};

const formSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
});

function Content({ id, editClassName, onBack }: Props) {
  const knowledgeStore = useKnowledgeStore();
  const defaultValues = useMemo(() => {
    const { knowledges } = useKnowledgeStore.getState();
    const detail = knowledges.find((item) => item.id === id);
    return detail
      ? { title: detail.title, content: detail.content }
      : { title: "", content: "" };
  }, [id]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const currentTime = Date.now();
    knowledgeStore.update(id, { ...values, updatedAt: currentTime });
    if (onBack) onBack();
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        onReset={() => form.reset()}
        className="space-y-4 max-sm:space-y-2"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Please enter a title..." {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content (Markdown)</FormLabel>
              <FormControl>
                <MagicDownEditor
                  className={editClassName}
                  defaultValue={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <div className={cn("flex", onBack ? "justify-between" : "justify-end")}>
          {onBack ? (
            <Button type="button" variant="secondary" onClick={() => onBack()}>
              Back
            </Button>
          ) : null}
          <div className="flex gap-2">
            <Button type="reset" variant="secondary">
              Reset
            </Button>
            <Button type="submit">Submit</Button>
          </div>
        </div>
      </form>
    </Form>
  );
}

export default Content;
