import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { useSettingStore } from "@/store/setting";

export function useGoogleProvider() {
  const { apiKey, apiProxy = "https://generativelanguage.googleapis.com" } =
    useSettingStore();

  if (!apiKey) throw new Error("API key missing");

  return createGoogleGenerativeAI({
    baseURL: `${apiProxy}/v1beta`,
    apiKey,
  });
}
