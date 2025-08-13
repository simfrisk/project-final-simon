import { create } from 'zustand'

type EditingState = {
  isEditingClass: boolean
  isEditingProject: boolean
  isRemovingClass: boolean
  isRemovingProject: boolean
  removingProjectId: string | null;
  removingClassId: string | null;
  setIsEditingClass: (value: boolean) => void
  setIsRemovingProject: (value: boolean) => void
  setIsEditingProject: (value: boolean) => void
  setIsRemovingClass: (value: boolean) => void

  setRemovingProjectId: (id: string | null) => void;
  setRemovingClassId: (id: string | null) => void;
}

export const useEditingStore = create<EditingState>((set) => ({
  isEditingClass: false,
  isRemovingClass: false,
  isEditingProject: false,
  isRemovingProject: false,
  removingProjectId: null,
  removingClassId: null,
  setIsEditingClass: (value) => set({ isEditingClass: value }),
  setIsRemovingClass: (value) => set({ isRemovingClass: value }),
  setIsEditingProject: (value) => set({ isEditingProject: value }),
  setIsRemovingProject: (value) => set({ isRemovingProject: value }),

  setRemovingProjectId: (id) => set({ removingProjectId: id }),
  setRemovingClassId: (id) => set({ removingClassId: id }),
}))