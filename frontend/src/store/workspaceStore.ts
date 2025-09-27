//#region ----- IMPORTS -----
import { create } from "zustand"
import { getToken } from "../utils/token"
import { baseUrl } from "../config/api"
//#endregion

//#region ----- INTERFACES -----
export interface WorkspaceType {
  _id: string
  name: string
  createdBy: string
  createdAt: string
  teams: string[]
  schemaVersion: string
}

interface WorkspaceStore {
  workspaces: WorkspaceType[]
  workspace: WorkspaceType | null
  loading: boolean
  error: string | null
  message: string | null

  fetchWorkspaces: () => Promise<void>
  fetchWorkspaceById: (workspaceId: string) => Promise<void>
  createWorkspace: (
    workspaceName: string
  ) => Promise<{ success: boolean; message?: string; workspaceId?: string }>
  updateWorkspace: (workspaceId: string, updates: { newName?: string }) => Promise<void>
  deleteWorkspace: (workspaceId: string) => Promise<void>
}

//#endregion

//#region ----- ZUSTAND WORKSPACE STORE -----
export const useWorkspaceStore = create<WorkspaceStore>((set, get) => ({
  workspaces: [],
  workspace: null,
  loading: false,
  error: null,
  message: null,

  //#region ----- FETCH WORKSPACES -----
  fetchWorkspaces: async () => {
    set({ loading: true, error: null, message: null })
    try {
      const token = getToken()
      if (!token) throw new Error("Missing access token")

      const response = await fetch(`${baseUrl}/workspaces`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      })

      const json = await response.json()
      if (response.ok && json.success) {
        set({
          workspaces: json.response,
          loading: false,
          message: json.message || null,
        })
      } else {
        throw new Error(json.message || "Failed to fetch workspaces")
      }
    } catch (err: any) {
      set({ loading: false, error: err.message || "Unknown error" })
    }
  },
  //#endregion

  //#region ----- FETCH WORKSPACE BY ID -----
  fetchWorkspaceById: async (workspaceId: string) => {
    set({ loading: true, error: null, message: null })
    try {
      const token = getToken()
      if (!token) throw new Error("Missing access token")

      const response = await fetch(`${baseUrl}/workspace/${workspaceId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      })

      const json = await response.json()
      if (response.ok && json.success) {
        set({
          workspace: json.response,
          loading: false,
          message: json.message || null,
        })
      } else {
        throw new Error(json.message || "Failed to fetch workspace")
      }
    } catch (err: any) {
      set({ loading: false, error: err.message || "Unknown error" })
    }
  },
  //#endregion

  //#region ----- CREATE WORKSPACE -----
  createWorkspace: async (workspaceName: string) => {
    set({ loading: true, error: null, message: null })
    try {
      const token = getToken()
      if (!token) throw new Error("Missing access token")

      const res = await fetch(`${baseUrl}/workspace`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({ name: workspaceName }),
      })

      const json = await res.json()
      if (res.ok && json.success) {
        const createdWorkspace = json.response
        set((state) => ({
          workspaces: [...state.workspaces, createdWorkspace],
          loading: false,
          message: json.message || null,
        }))
        return {
          success: true,
          message: json.message || "Workspace created successfully",
          workspaceId: createdWorkspace._id,
        }
      } else {
        return {
          success: false,
          message: json.message || "Failed to create workspace",
        }
      }
    } catch (err: any) {
      set({ loading: false, error: err.message || "Unknown error" })
      return {
        success: false,
        message: err.message || "Failed to create workspace",
      }
    }
  },
  //#endregion

  //#region ----- UPDATE WORKSPACE -----
  updateWorkspace: async (workspaceId: string, updates: { newName?: string }) => {
    set({ loading: true, error: null, message: null })

    try {
      const token = getToken()
      if (!token) throw new Error("Missing access token")

      const response = await fetch(`${baseUrl}/workspace/${workspaceId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) throw new Error("Failed to update workspace")

      const data = await response.json()

      if (data.success && data.response) {
        const updatedWorkspace = data.response

        set((state) => ({
          workspaces: state.workspaces.map((w) =>
            w._id === workspaceId ? { ...w, ...updatedWorkspace } : w
          ),
          workspace:
            state.workspace && state.workspace._id === workspaceId
              ? { ...state.workspace, ...updatedWorkspace }
              : state.workspace,
          loading: false,
          error: null,
          message: data.message || "Workspace updated successfully",
        }))
      } else {
        set({
          loading: false,
          error: data.message || "Update failed",
          message: null,
        })
      }
    } catch (err: any) {
      set({
        loading: false,
        error: err.message || "Unknown error",
        message: null,
      })
    }
  },
  //#endregion

  //#region ----- DELETE WORKSPACE -----
  deleteWorkspace: async (workspaceId: string) => {
    set({ loading: true, error: null, message: null })
    try {
      const token = getToken()
      if (!token) throw new Error("Missing access token")

      const response = await fetch(`${baseUrl}/workspace/${workspaceId}`, {
        method: "DELETE",
        headers: {
          Authorization: token,
        },
      })

      const data = await response.json()
      if (response.ok && data.success) {
        set((state) => ({
          workspaces: state.workspaces.filter((w) => w._id !== workspaceId),
          workspace: state.workspace?._id === workspaceId ? null : state.workspace,
          loading: false,
          message: data.message || null,
        }))
      } else {
        throw new Error(data.message || "Failed to delete workspace")
      }
    } catch (err: any) {
      set({ loading: false, error: err.message || "Unknown error" })
    }
  },
  //#endregion
}))
//#endregion
