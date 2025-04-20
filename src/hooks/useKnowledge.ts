import { streamText } from "ai";
import { toast } from "sonner";
import useModelProvider from "@/hooks/useAiProvider";
import { useKnowledgeStore } from "@/store/knowledge";
import { useTaskStore } from "@/store/task";
import { informationCollectorPrompt } from "@/utils/deep-research";
import { fileParser } from "@/utils/parser";
import { generateFileId } from "@/utils/file";
import { parseError } from "@/utils/error";
import { omit } from "radash";

function handleError(error: unknown) {
  const errorMessage = parseError(error);
  toast.error(errorMessage);
}

function useKnowledge() {
  const { createProvider, getModel } = useModelProvider();
  const knowledgeStore = useKnowledgeStore();

  async function processingKnowledge(file: File) {
    const { resources, addResource, updateResource } = useTaskStore.getState();

    const fileMeta: FileMeta = {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
    };
    const id = generateFileId(fileMeta);
    const isExist = resources.find((item) => item.id === id);
    console.log(isExist);
    if (isExist) {
      return toast.message(`File already exist: ${file.name}`);
    }
    try {
      if (!knowledgeStore.exist(id)) {
        addResource({
          ...omit(fileMeta, ["lastModified"]),
          id,
          from: "upload",
          status: "processing",
        });
        const { networkingModel } = getModel();
        const text = await fileParser(file);
        if (text.length > 5000 || !file.type.startsWith("text/")) {
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
        } else {
          knowledgeStore.save({
            id,
            title: fileMeta.name,
            content: text,
            fileMeta,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });
        }
        updateResource(id, { status: "completed" });
      } else {
        const knowledge = knowledgeStore.get(id);
        if (knowledge) {
          addResource({
            ...omit(knowledge.fileMeta, ["lastModified"]),
            id,
            from: "knowledge",
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
    processingKnowledge,
  };
}

export default useKnowledge;
