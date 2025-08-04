import { create } from 'zustand'

type EditingState = {
  isEditingClass: boolean
  isEditingProject: boolean
  setIsEditingClass: (value: boolean) => void
  setIsEditingProject: (value: boolean) => void
}

export const useEditingStore = create<EditingState>((set) => ({
  isEditingClass: false,
  isEditingProject: false,
  setIsEditingClass: (value) => set({ isEditingClass: value }),
  setIsEditingProject: (value) => set({ isEditingProject: value }),
}))