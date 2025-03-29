import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SettingStore {
  provider: string;
  mode: string;
  apiKey: string;
  apiProxy: string;
  accessPassword: string;
  thinkingModel: string;
  networkingModel: string;
  language: string;
  theme: string;
}

interface SettingFunction {
  update: (values: Partial<SettingStore>) => void;
}

export const defaultValues: SettingStore = {
  provider: "google",
  mode: "",
  apiKey: "",
  apiProxy: "",
  accessPassword: "",
  thinkingModel: "gemini-2.0-flash-thinking-exp",
  networkingModel: "gemini-2.0-flash-exp",
  language: "",
  theme: "system",
};

export const useSettingStore = create(
  persist<SettingStore & SettingFunction>(
    (set) => ({
      ...defaultValues,
      update: (values) => set(values),
    }),
    { name: "setting" }
  )
);
