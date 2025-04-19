import { streamText } from "ai";
import { Md5 } from "ts-md5";
import { toast } from "sonner";
import useModelProvider from "@/hooks/useAiProvider";
import { useKnowledgeStore } from "@/store/knowledge";
import { useTaskStore } from "@/store/task";
import { informationCollectorPrompt } from "@/utils/deep-research";
import { fileParser } from "@/utils/parser";
import { parseError } from "@/utils/error";
import { omit } from "radash";

function handleError(error: unknown) {
  const errorMessage = parseError(error);
  toast.error(errorMessage);
}

function useKnowledge() {
  const { createProvider, getModel } = useModelProvider();
  const { save, exist } = useKnowledgeStore();

  function generateId(file: File) {
    const meta = `${file.name}::${file.size}::${file.type}::${file.lastModified}`;
    return Md5.hashStr(meta);
  }

  async function processingKnowledge(file: File) {
    const { addResource, updateResource } = useTaskStore.getState();

    const fileMeta = {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
    };
    const id = generateId(file);
    addResource({
      ...omit(fileMeta, ["lastModified"]),
      id,
      status: "unprocessed",
    });
    try {
      if (!exist(id)) {
        updateResource(id, { status: "processing" });
        const { networkingModel } = getModel();
        const text = await fileParser(file);
        if (text.length > 5000 || !file.type.startsWith("text/")) {
          let content = "";
          const result = streamText({
            model: createProvider(networkingModel),
            prompt: text,
            system: informationCollectorPrompt(),
            onFinish: () => {
              save({
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
          save({
            id,
            title: fileMeta.name,
            content: text,
            fileMeta,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });
        }
      } else {
        console.info(`File already exist: ${file.name}`);
      }
      updateResource(id, { status: "completed" });
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
