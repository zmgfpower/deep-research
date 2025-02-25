import { createGoogleGenerativeAI } from "@ai-sdk/google";

const GOOGLE_GENERATIVE_AI_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
const API_PROXY_BASE_URL = process.env.NEXT_PUBLIC_API_PROXY_BASE_URL;

export const google = createGoogleGenerativeAI({
  baseURL: `${API_PROXY_BASE_URL}/v1beta`,
  apiKey: GOOGLE_GENERATIVE_AI_API_KEY,
});
