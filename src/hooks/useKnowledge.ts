import { streamText } from "ai";
import { Md5 } from "ts-md5";
import { toast } from "sonner";
import useModelProvider from "@/hooks/useAiProvider";
import { useKnowledgeStore } from "@/store/knowledge";
import { useTaskStore } from "@/store/task";
import { informationCollectorPrompt } from "@/utils/deep-research";
import { fileParser } from "@/utils/parser";
import { getTextByteSize } from "@/utils/file";
import { parseError } from "@/utils/error";
import { omit } from "radash";

function handleError(error: unknown) {
  const errorMessage = parseError(error);
  toast.error(errorMessage);
}

function useKnowledge() {
  const { createProvider, getModel } = useModelProvider();
  const knowledgeStore = useKnowledgeStore();

  function generateId(
    type: "file" | "url" | "knowledge",
    options?: {
      fileMeta?: FileMeta;
      url?: string;
    }
  ): string {
    if (type === "file" && options && options.fileMeta) {
      const { fileMeta } = options;
      const meta = `${fileMeta.name}::${fileMeta.size}::${fileMeta.type}::${fileMeta.lastModified}`;
      return Md5.hashStr(meta);
    } else if (type === "url" && options && options.url) {
      return Md5.hashStr(
        `${options.url}::${Date.now().toString().substring(0, 8)}`
      );
    } else if (type === "knowledge") {
      return Md5.hashStr(`KNOWLEDGE::${Date.now()}`);
    } else {
      throw new Error("Parameter error");
    }
  }

  async function processingKnowledge(file: File) {
    const { resources, addResource, updateResource } = useTaskStore.getState();

    const fileMeta: FileMeta = {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
    };
    const id = generateId("file", { fileMeta });
    const isExist = resources.find((item) => item.id === id);
    if (isExist) {
      return toast.message(`File already exist: ${file.name}`);
    }
    try {
      if (!knowledgeStore.exist(id)) {
        addResource({
          ...omit(fileMeta, ["lastModified"]),
          id,
          status: "processing",
        });
        const { networkingModel } = getModel();
        const text = await fileParser(file);
        if (text.length > 20480 || !file.type.startsWith("text/")) {
          let content = "";
          const result = streamText({
            model: createProvider(networkingModel),
            prompt: text,
            system: informationCollectorPrompt(),
            onFinish: () => {
              knowledgeStore.save({
                id,
                title: fileMeta.name,
                content,
                type: "file",
                fileMeta,
                createdAt: Date.now(),
                updatedAt: Date.now(),
              });
            },
            onError: (err) => {
              updateResource(id, { status: "failed" });
              handleError(err);
            },
          });
          for await (const textPart of result.textStream) {
            content += textPart;
          }
          updateResource(id, {
            size: getTextByteSize(content),
            status: "completed",
          });
        } else {
          knowledgeStore.save({
            id,
            title: fileMeta.name,
            content: text,
            type: "file",
            fileMeta,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });
          updateResource(id, {
            size: getTextByteSize(text),
            status: "completed",
          });
        }
      } else {
        const knowledge = knowledgeStore.get(id);
        if (knowledge) {
          addResource({
            id,
            name: knowledge.title,
            type: knowledge.type,
            size: getTextByteSize(knowledge.content),
            status: "completed",
          });
        }
      }
    } catch (err) {
      if (err instanceof Error) {
        updateResource(id, { status: "failed" });
        toast.error(err.message);
      } else {
        toast.error("File parsing failed");
      }
    }
  }

  return {
    generateId,
    processingKnowledge,
  };
}

export default useKnowledge;
