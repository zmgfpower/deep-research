import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { useSettingStore } from "@/store/setting";

export function useGoogleProvider() {
  const { apiKey, apiProxy, accessPassword } = useSettingStore();

  return createGoogleGenerativeAI(
    apiKey
      ? {
          baseURL: `${
            apiProxy || "https://generativelanguage.googleapis.com"
          }/v1beta`,
          apiKey,
        }
      : {
          baseURL: "/api/ai/google/v1beta",
          apiKey: accessPassword,
        }
  );
}
