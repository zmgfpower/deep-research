import { useState } from "react";
import { useSettingStore } from "@/store/setting";
import {
  GEMINI_BASE_URL,
  OPENROUTER_BASE_URL,
  OPENAI_BASE_URL,
  DEEPSEEK_BASE_URL,
} from "@/constants/urls";
import { shuffle } from "radash";

interface GeminiModel {
  name: string;
  description: string;
  displayName: string;
  inputTokenLimit: number;
  maxTemperature?: number;
  outputTokenLimit: number;
  temperature?: number;
  topK?: number;
  topP?: number;
  supportedGenerationMethods: string[];
  version: string;
}

interface OpenRouterModel {
  id: string;
  name: string;
  created: number;
  description: string;
  context_length: number;
  architecture: {
    modality: string;
    tokenizer: string;
    instruct_type?: string;
  };
  top_provider: {
    context_length: number;
    max_completion_tokens: number;
    is_moderated: boolean;
  };
  pricing: {
    prompt: string;
    completion: string;
    image: string;
    request: string;
    input_cache_read: string;
    input_cache_write: string;
    web_search: string;
    internal_reasoning: string;
  };
  per_request_limits: Record<string, string> | null;
}

interface OpenAIModel {
  id: string;
  object: string;
  created: number;
  owned_by: string;
}

function useModelList() {
  const [modelList, setModelList] = useState<string[]>([]);

  async function refresh(): Promise<string[]> {
    const {
      provider,
      apiKey = "",
      apiProxy,
      accessPassword,
    } = useSettingStore.getState();
    const apiKeys = shuffle(apiKey.split(","));

    if (apiKey || accessPassword) {
      if (provider === "google") {
        const response = await fetch(
          apiKeys[0]
            ? `${apiProxy || GEMINI_BASE_URL}${
                apiProxy.includes("/v1") ? "" : "/v1beta"
              }/models`
            : "/api/ai/google/v1beta/models",
          {
            headers: {
              "x-goog-api-key": apiKeys[0] ? apiKeys[0] : accessPassword,
            },
          }
        );
        const { models = [] } = await response.json();
        const newModelList = (models as GeminiModel[])
          .filter(
            (item) =>
              item.name.startsWith("models/gemini") &&
              item.supportedGenerationMethods.includes("generateContent")
          )
          .map((item) => item.name.replace("models/", ""));
        setModelList(newModelList);
        return newModelList;
      } else if (provider === "openrouter") {
        const response = await fetch(
          apiKeys[0]
            ? `${apiProxy || `${OPENROUTER_BASE_URL}/api`}${
                apiProxy.includes("/v1") ? "" : "/v1"
              }/models`
            : "/api/ai/openrouter/v1/models",
          {
            headers: {
              authorization: `Bearer ${
                apiKeys[0] ? apiKeys[0] : accessPassword
              }`,
            },
          }
        );
        const { data = [] } = await response.json();
        const newModelList = (data as OpenRouterModel[]).map((item) => item.id);
        setModelList(newModelList);
        return newModelList;
      } else if (provider === "openai") {
        const response = await fetch(
          apiKeys[0]
            ? `${apiProxy || `${OPENAI_BASE_URL}`}${
                apiProxy.includes("/v1") ? "" : "/v1"
              }/models`
            : "/api/ai/openai/v1/models",
          {
            headers: {
              authorization: `Bearer ${
                apiKeys[0] ? apiKeys[0] : accessPassword
              }`,
            },
          }
        );
        const { data = [] } = await response.json();
        const newModelList = (data as OpenAIModel[]).map((item) => item.id);
        setModelList(newModelList);
        return newModelList;
      } else if (provider === "deepseek") {
        const response = await fetch(
          apiKeys[0]
            ? `${apiProxy || `${DEEPSEEK_BASE_URL}`}${
                apiProxy.includes("/v1") ? "" : "/v1"
              }/models`
            : "/api/ai/deepseek/v1/models",
          {
            headers: {
              authorization: `Bearer ${
                apiKeys[0] ? apiKeys[0] : accessPassword
              }`,
            },
          }
        );
        const { data = [] } = await response.json();
        const newModelList = (data as OpenAIModel[]).map((item) => item.id);
        setModelList(newModelList);
        return newModelList;
      }
    }
    return [];
  }

  return {
    modelList,
    refresh,
  };
}

export default useModelList;
