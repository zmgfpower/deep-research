import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { useSettingStore } from "@/store/setting";

export function useGoogleProvider() {
  const { apiKey, apiProxy } = useSettingStore();

  return createGoogleGenerativeAI({
    baseURL: `${apiProxy || "/ai/google"}/v1beta`,
    apiKey,
  });
}
