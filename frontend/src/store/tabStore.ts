import { create } from "zustand";

interface TabStore {
  activeTab: "description" | "question" | "comments";
  setActiveTab: (tab: "description" | "question" | "comments") => void;
}

export const useTabStore = create<TabStore>((set) => ({
  activeTab: "question",
  setActiveTab: (tab) => set({ activeTab: tab }),
}));