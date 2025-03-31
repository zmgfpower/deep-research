import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { createOpenAI } from "@ai-sdk/openai";
import { createDeepSeek } from "@ai-sdk/deepseek";
import { useSettingStore } from "@/store/setting";
import {
  GEMINI_BASE_URL,
  OPENROUTER_BASE_URL,
  OPENAI_BASE_URL,
  DEEPSEEK_BASE_URL,
} from "@/constants/urls";
import { shuffle } from "radash";

export function useModelProvider() {
  const { provider, apiKey = "", apiProxy, accessPassword } = useSettingStore();

  function createProvider(model: string, settings?: any) {
    const apiKeys = shuffle(apiKey.split(","));

    if (provider === "google") {
      const google = createGoogleGenerativeAI({
        baseURL: apiKeys[0]
          ? `${apiProxy || GEMINI_BASE_URL}${
              apiProxy.includes("/v1") ? "" : "/v1beta"
            }`
          : "/api/ai/google/v1beta",
        apiKey: apiKeys[0] ? apiKeys[0] : accessPassword,
      });
      return google(model, settings);
    } else if (provider === "openrouter") {
      const openrouter = createOpenRouter({
        baseURL: apiKeys[0]
          ? `${apiProxy || `${OPENROUTER_BASE_URL}/api`}${
              apiProxy.includes("/v1") ? "" : "/v1"
            }`
          : "/api/ai/openrouter/v1",
        apiKey: apiKeys[0] ? apiKeys[0] : accessPassword,
      });
      return openrouter(model, settings);
    } else if (provider === "openai") {
      const openai = createOpenAI({
        baseURL: apiKeys[0]
          ? `${apiProxy || OPENAI_BASE_URL}${
              apiProxy.includes("/v1") ? "" : "/v1"
            }`
          : "/api/ai/openai/v1",
        apiKey: apiKeys[0] ? apiKeys[0] : accessPassword,
      });
      return model.startsWith("gpt-4o")
        ? openai.responses(model)
        : openai(model, settings);
    } else if (provider === "deepseek") {
      const deepseek = createDeepSeek({
        baseURL: apiKeys[0]
          ? `${apiProxy || DEEPSEEK_BASE_URL}${
              apiProxy.includes("/v1") ? "" : "/v1"
            }`
          : "/api/ai/deepseek/v1",
        apiKey: apiKeys[0] ? apiKeys[0] : accessPassword,
      });
      return deepseek(model, settings);
    } else {
      throw new Error("Unsupported Provider: " + provider);
    }
  }

  return {
    createProvider,
  };
}
