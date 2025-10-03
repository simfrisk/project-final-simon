//#region ----- IMPORTS -----
import { create } from "zustand"
import { getToken } from "../utils/token"
import { baseUrl } from "../config/api"

//#endregion

//#region ----- INTERFACES -----
export interface ClassType {
  _id: string
  classTitle: string
  workspaceId?: string
}

interface ClassesStore {
  classes: ClassType[]
  class: ClassType | null
  loading: boolean
  error: string | null
  message: string | null

  fetchClasses: (workspaceId: string) => Promise<void>
  fetchClassById: (classId: string) => Promise<void>
  addClass: (classTitle: string, workspaceId: string) => Promise<void>
  deleteClass: (classId: string) => Promise<void>
  updateClass: (
    classId: string,
    updates: { newTitle?: string; newWorkspaceId?: string }
  ) => Promise<void>
  getClassesByWorkspace: (workspaceId: string) => ClassType[]
  clearClasses: () => void
}

//#endregion

//#region ----- ZUSTAND CLASS STORE -----
export const useClassStore = create<ClassesStore>((set, get) => ({
  classes: [],
  class: null,
  loading: false,
  error: null,
  message: null,

  fetchClasses: async (workspaceId: string) => {
    set({ loading: true, error: null, message: null })
    try {
      const token = getToken()
      if (!token) throw new Error("Missing access token")

      const response = await fetch(`${baseUrl}/workspace/${workspaceId}/classes`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      })

      const json = await response.json()
      if (response.ok && json.success) {
        set({
          classes: json.response,
          loading: false,
          message: json.message || null,
        })
      } else {
        throw new Error(json.message || "Failed to fetch classes")
      }
    } catch (err: unknown) {
      set({ loading: false, error: err instanceof Error ? err.message : "Unknown error" })
    }
  },

  //#endregion

  //#region ----- FETCH CLASS BY ID -----
  fetchClassById: async (classId: string) => {
    set({ loading: true, error: null, message: null })
    try {
      const token = getToken()
      if (!token) throw new Error("Missing access token")

      const response = await fetch(`${baseUrl}/classes/${classId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      })

      const json = await response.json()
      if (response.ok && json.success) {
        set({
          class: json.response,
          loading: false,
          message: json.message || null,
        })
      } else {
        throw new Error(json.message || "Failed to fetch class")
      }
    } catch (err: unknown) {
      set({ loading: false, error: err instanceof Error ? err.message : "Unknown error" })
    }
  },
  //#endregion

  //#region ----- ADD CLASS -----
  addClass: async (classTitle: string, workspaceId: string) => {
    set({ loading: true, error: null, message: null })
    try {
      const token = getToken()
      if (!token) throw new Error("Missing access token")

      const res = await fetch(`${baseUrl}/workspace/${workspaceId}/classes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({ classTitle }),
      })

      const json = await res.json()
      if (res.ok && json.success) {
        set((state) => ({
          classes: [...state.classes, json.response],
          loading: false,
          message: json.message || null,
        }))
      } else {
        throw new Error(json.message || "Failed to add class")
      }
    } catch (err: unknown) {
      set({ loading: false, error: err instanceof Error ? err.message : "Unknown error" })
    }
  },

  //#endregion

  //#region ----- DELETE CLASS -----
  deleteClass: async (classId: string) => {
    set({ loading: true, error: null, message: null })
    try {
      const token = getToken()
      if (!token) throw new Error("Missing access token")

      const response = await fetch(`${baseUrl}/classes/${classId}`, {
        method: "DELETE",
        headers: {
          Authorization: token,
        },
      })

      const data = await response.json()
      if (response.ok && data.success) {
        set((state) => ({
          classes: state.classes.filter((cls) => cls._id !== classId),
          loading: false,
          message: data.message || null,
        }))
      } else {
        throw new Error(data.message || "Failed to delete class")
      }
    } catch (err: unknown) {
      set({ loading: false, error: err instanceof Error ? err.message : "Unknown error" })
    }
  },

  //#endregion

  //#region ----- UPDATE CLASS -----

  updateClass: async (classId: string, updates: { newTitle?: string; newWorkspaceId?: string }) => {
    set({ loading: true, error: null, message: null })

    try {
      const token = getToken()
      if (!token) throw new Error("Missing access token")

      const response = await fetch(`${baseUrl}/classes/${classId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(updates), // { newTitle: "..." }
      })

      if (!response.ok) throw new Error("Failed to update class")

      const data = await response.json()

      if (data.success && data.response) {
        const updatedClass = data.response

        set((state) => ({
          classes: state.classes.map((c) => (c._id === classId ? { ...c, ...updatedClass } : c)),
          class:
            state.class && state.class._id === classId
              ? { ...state.class, ...updatedClass }
              : state.class,
          loading: false,
          error: null,
          message: data.message || "Class updated successfully",
        }))
      } else {
        set({
          loading: false,
          error: data.message || "Update failed",
          message: null,
        })
      }
    } catch (err: unknown) {
      set({
        loading: false,
        error: err instanceof Error ? err.message : "Unknown error",
        message: null,
      })
    }
  },

  //#endregion

  //#region ----- GET CLASSES BY WORKSPACE -----

  getClassesByWorkspace: (workspaceId: string) => {
    const { classes } = get()
    return classes.filter((cls) => cls.workspaceId === workspaceId)
  },

  //#endregion

  //#region ----- CLEAR CLASSES -----

  clearClasses: () => {
    set({
      classes: [],
      class: null,
      loading: false,
      error: null,
      message: null,
    })
  },

  //#endregion
}))
