import { useState } from "react";
import { useSettingStore } from "@/store/setting";
import { GEMINI_BASE_URL, OPENROUTER_BASE_URL } from "@/constants/urls";
import { shuffle } from "radash";

function useModel() {
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
      }
    }
    return [];
  }

  return {
    modelList,
    refresh,
  };
}

export default useModel;
