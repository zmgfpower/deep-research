"use client";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { LoaderCircle, History, PlusCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { HistoryDialog } from "@/components/Research/History";
import useDeepResearch from "@/hooks/useDeepResearch";
import { useGlobalStore } from "@/store/global";
import { useSettingStore } from "@/store/setting";
import { useTaskStore } from "@/store/task";

const formSchema = z.object({
  topic: z.string().min(2),
});

function Topic() {
  const { t } = useTranslation();
  const { askQuestions } = useDeepResearch();
  const taskStore = useTaskStore();
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: taskStore.question || "",
    },
  });

  // 当taskStore.question变化时更新表单值
  useEffect(() => {
    form.setValue("topic", taskStore.question || "");
  }, [taskStore.question, form]);

  async function handleSubmit(values: z.infer<typeof formSchema>) {
    const { apiKey, accessPassword } = useSettingStore.getState();
    if (apiKey || accessPassword) {
      const { setQuestion } = useTaskStore.getState();
      setIsThinking(true);
      setQuestion(values.topic);
      await askQuestions();
      setIsThinking(false);
    } else {
      const { setOpenSetting } = useGlobalStore.getState();
      setOpenSetting(true);
    }
  }

  // 创建新对话的处理函数
  function handleNewConversation() {
    const { clearAll } = useTaskStore.getState();
    clearAll();
    form.reset(); // 重置表单
  }

  return (
    <section className="p-4 border rounded-md mt-4">
      <div className="flex justify-between items-center border-b mb-2">
        <h3 className="font-semibold text-lg leading-10">
          {t("research.topic.title")}
        </h3>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNewConversation}
            title={t("research.common.newConversation")}
          >
            <PlusCircle className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowHistory(true)}
            title={t("research.history.title")}
          >
            <History className="h-5 w-5" />
          </Button>
        </div>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <FormField
            control={form.control}
            name="topic"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="mb-2 font-semibold">
                  {t("research.topic.topicLabel")}
                </FormLabel>
                <FormControl>
                  <Textarea
                    rows={3}
                    placeholder={t("research.topic.topicPlaceholder")}
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <Button className="mt-4 w-full" disabled={isThinking} type="submit">
            {isThinking ? (
              <>
                <LoaderCircle className="animate-spin" />
                {t("research.common.thinkingQuestion")}
              </>
            ) : (
              t("research.common.startThinking")
            )}
          </Button>
        </form>
      </Form>
      <HistoryDialog open={showHistory} onClose={() => setShowHistory(false)} />
    </section>
  );
}

export default Topic;
