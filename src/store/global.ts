import { create } from "zustand";

interface GlobalStore {
  openSetting: boolean;
}

interface GlobalFunction {
  setOpenSetting: (visible: boolean) => void;
}

export const useGlobalStore = create<GlobalStore & GlobalFunction>((set) => ({
  openSetting: false,
  setOpenSetting: (visible) => set({ openSetting: visible }),
}));
