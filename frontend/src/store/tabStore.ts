import { create } from "zustand"

interface TabStore {
  activeTab: "description" | "question" | "public" | "private"
  setActiveTab: (tab: "description" | "question" | "public" | "private") => void
}

export const useTabStore = create<TabStore>((set) => ({
  activeTab: "question",
  setActiveTab: (tab) => set({ activeTab: tab }),
}))
