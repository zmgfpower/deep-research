import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { useSettingStore } from "@/store/setting";
import { GEMINI_BASE_URL, OPENROUTER_BASE_URL } from "@/constants/urls";
import { shuffle } from "radash";

export function useModelProvider() {
  const { provider, apiKey = "", apiProxy, accessPassword } = useSettingStore();

  function createProvider() {
    const apiKeys = shuffle(apiKey.split(","));

    if (provider === "google") {
      return createGoogleGenerativeAI(
        apiKeys[0]
          ? {
              baseURL: `${apiProxy || GEMINI_BASE_URL}${
                apiProxy.includes("/v1") ? "" : "/v1beta"
              }`,
              apiKey: apiKeys[0],
            }
          : {
              baseURL: "/api/ai/google/v1beta",
              apiKey: accessPassword,
            }
      );
    } else if (provider === "openrouter") {
      return createOpenRouter(
        apiKeys[0]
          ? {
              baseURL: `${apiProxy || OPENROUTER_BASE_URL}${
                apiProxy.includes("/v1") ? "" : "/v1"
              }`,
              apiKey: apiKeys[0],
            }
          : {
              baseURL: "/api/ai/openrouter/api/v1",
              apiKey: accessPassword,
            }
      );
    } else {
      throw new Error("Unsupported Provider: " + provider);
    }
  }

  return {
    createProvider,
  };
}
