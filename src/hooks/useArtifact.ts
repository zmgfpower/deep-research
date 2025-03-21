import { useState } from "react";
import { streamText, smoothStream } from "ai";
import { toast } from "sonner";
import { useGoogleProvider } from "@/hooks/useAiProvider";
import { useTaskStore } from "@/store/task";
import {
  AIWritePrompt,
  changeLanguagePrompt,
  changeReadingLevelPrompt,
  adjustLengthPrompt,
  continuationPrompt,
  addEmojisPrompt,
} from "@/utils/artifact";
import { getSystemPrompt } from "@/utils/deep-research";
import { parseError } from "@/utils/error";

function handleError(error: unknown) {
  const errorMessage = parseError(error);
  toast.error(errorMessage);
}

function useArtifact() {
  const google = useGoogleProvider();
  const [loadingAction, setLoadingAction] = useState<string>("");

  async function AIWrite(prompt: string) {
    const { finalReport, updateFinalReport } = useTaskStore.getState();
    setLoadingAction("aiWrite");
    const result = streamText({
      model: google("gemini-2.0-flash-thinking-exp"),
      prompt: AIWritePrompt(finalReport, prompt, getSystemPrompt()),
      experimental_transform: smoothStream(),
      onError: handleError,
    });
    let text = "";
    for await (const textPart of result.textStream) {
      text += textPart;
      updateFinalReport(text);
    }
    text = "";
    setLoadingAction("");
  }

  async function translate(lang: string) {
    const { finalReport, updateFinalReport } = useTaskStore.getState();
    setLoadingAction("translate");
    const result = streamText({
      model: google("gemini-2.0-flash-thinking-exp"),
      prompt: changeLanguagePrompt(finalReport, lang, getSystemPrompt()),
      experimental_transform: smoothStream(),
      onError: handleError,
    });
    let text = "";
    for await (const textPart of result.textStream) {
      text += textPart;
      updateFinalReport(text);
    }
    text = "";
    setLoadingAction("");
  }

  async function changeReadingLevel(level: string) {
    const { finalReport, updateFinalReport } = useTaskStore.getState();
    setLoadingAction("readingLevel");
    const result = streamText({
      model: google("gemini-2.0-flash-thinking-exp"),
      prompt: changeReadingLevelPrompt(finalReport, level, getSystemPrompt()),
      experimental_transform: smoothStream(),
      onError: handleError,
    });
    let text = "";
    for await (const textPart of result.textStream) {
      text += textPart;
      updateFinalReport(text);
    }
    text = "";
    setLoadingAction("");
  }

  async function adjustLength(length: string) {
    const { finalReport, updateFinalReport } = useTaskStore.getState();
    setLoadingAction("adjustLength");
    const result = streamText({
      model: google("gemini-2.0-flash-thinking-exp"),
      prompt: adjustLengthPrompt(finalReport, length, getSystemPrompt()),
      experimental_transform: smoothStream(),
      onError: handleError,
    });
    let text = "";
    for await (const textPart of result.textStream) {
      text += textPart;
      updateFinalReport(text);
    }
    text = "";
    setLoadingAction("");
  }

  async function continuation() {
    const { finalReport, updateFinalReport } = useTaskStore.getState();
    setLoadingAction("continuation");
    const result = streamText({
      model: google("gemini-2.0-flash-thinking-exp"),
      prompt: continuationPrompt(finalReport, getSystemPrompt()),
      experimental_transform: smoothStream(),
      onError: handleError,
    });
    let text = "";
    for await (const textPart of result.textStream) {
      text += textPart;
      updateFinalReport(text);
    }
    text = "";
    setLoadingAction("");
  }

  async function addEmojis() {
    const { finalReport, updateFinalReport } = useTaskStore.getState();
    setLoadingAction("addEmojis");
    const result = streamText({
      model: google("gemini-2.0-flash-thinking-exp"),
      prompt: addEmojisPrompt(finalReport, getSystemPrompt()),
      experimental_transform: smoothStream(),
      onError: handleError,
    });
    let text = "";
    for await (const textPart of result.textStream) {
      text += textPart;
      updateFinalReport(text);
    }
    text = "";
    setLoadingAction("");
  }

  return {
    loadingAction,
    AIWrite,
    translate,
    changeReadingLevel,
    adjustLength,
    continuation,
    addEmojis,
  };
}

export default useArtifact;
