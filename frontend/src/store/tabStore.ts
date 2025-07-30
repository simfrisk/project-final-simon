import { create } from "zustand";

interface TabStore {
  activeTab: "description" | "question" | "private";
  setActiveTab: (tab: "description" | "question" | "private") => void;
}

export const useTabStore = create<TabStore>((set) => ({
  activeTab: "question",
  setActiveTab: (tab) => set({ activeTab: tab }),
}));