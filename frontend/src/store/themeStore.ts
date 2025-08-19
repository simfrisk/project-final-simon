import { create } from "zustand"

type ThemeMode = "light" | "dark"

interface ThemeStore {
  themeMode: ThemeMode
  setThemeMode: (mode: ThemeMode) => void
  toggleTheme: () => void
}

export const useThemeStore = create<ThemeStore>((set) => ({
  themeMode: (localStorage.getItem("theme") as ThemeMode) || "light",
  setThemeMode: (mode) => {
    localStorage.setItem("theme", mode)
    set({ themeMode: mode })
  },
  toggleTheme: () => {
    set((state) => {
      const newMode = state.themeMode === "light" ? "dark" : "light"
      localStorage.setItem("theme", newMode)
      return { themeMode: newMode }
    })
  },
}))
