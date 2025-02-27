import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingStore {
  apiKey: string;
  apiProxy: string;
  update: (values: Partial<SettingStore>) => void;
}

export const useSettingStore = create(
  persist<SettingStore>(
    (set) => ({
      apiKey: "",
      apiProxy: "",
      update: (values) => set(values),
    }),
    { name: "setting" }
  )
);
