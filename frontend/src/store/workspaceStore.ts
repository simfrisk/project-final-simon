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
  currentWorkspaceId: string | null
  loading: boolean
  error: string | null
  message: string | null

  fetchWorkspaces: () => Promise<void>
  fetchUserWorkspaces: () => Promise<void>
  fetchWorkspaceById: (workspaceId: string) => Promise<void>
  setCurrentWorkspace: (workspaceId: string) => void
  loadCurrentWorkspace: () => void
  createWorkspace: (
    workspaceName: string
  ) => Promise<{ success: boolean; message?: string; workspaceId?: string }>
  updateWorkspace: (workspaceId: string, updates: { newName?: string }) => Promise<void>
  deleteWorkspace: (workspaceId: string) => Promise<void>
  createInvitationLink: (workspaceId: string, teamId?: string) => Promise<string | null>
  validateInvitationToken: (token: string) => Promise<boolean>
  clearWorkspaceData: () => void
}

//#endregion

//#region ----- GET CURRENT WORKSPACE FROM LOCAL STORAGE -----
const savedCurrentWorkspaceId = localStorage.getItem("currentWorkspaceId")
//#endregion

//#region ----- ZUSTAND WORKSPACE STORE -----
export const useWorkspaceStore = create<WorkspaceStore>((set) => ({
  workspaces: [],
  workspace: null,
  currentWorkspaceId: savedCurrentWorkspaceId,
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
    } catch (err: unknown) {
      set({ loading: false, error: err instanceof Error ? err.message : "Unknown error" })
    }
  },
  //#endregion

  //#region ----- FETCH USER WORKSPACES -----
  fetchUserWorkspaces: async () => {
    set({ loading: true, error: null, message: null })
    try {
      const token = getToken()
      if (!token) throw new Error("Missing access token")

      const response = await fetch(`${baseUrl}/user/workspaces`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      })

      const json = await response.json()
      if (response.ok && json.success) {
        set((state) => {
          const newState = {
            workspaces: json.response,
            loading: false,
            message: json.message || null,
          }

          // Auto-select first workspace if none is currently selected
          if (state.currentWorkspaceId === null && json.response.length > 0) {
            return { ...newState, currentWorkspaceId: json.response[0]._id }
          }

          return newState
        })
      } else {
        throw new Error(json.message || "Failed to fetch user workspaces")
      }
    } catch (err: unknown) {
      set({ loading: false, error: err instanceof Error ? err.message : "Unknown error" })
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
    } catch (err: unknown) {
      set({ loading: false, error: err instanceof Error ? err.message : "Unknown error" })
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
    } catch (err: unknown) {
      set({ loading: false, error: err instanceof Error ? err.message : "Unknown error" })
      return {
        success: false,
        message: err instanceof Error ? err.message : "Failed to create workspace",
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
    } catch (err: unknown) {
      set({
        loading: false,
        error: err instanceof Error ? err.message : "Unknown error",
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
    } catch (err: unknown) {
      set({ loading: false, error: err instanceof Error ? err.message : "Unknown error" })
    }
  },
  //#endregion

  //#region ----- SET CURRENT WORKSPACE -----
  setCurrentWorkspace: (workspaceId: string) => {
    localStorage.setItem("currentWorkspaceId", workspaceId)
    set({ currentWorkspaceId: workspaceId })

    // Also update the user store for backward compatibility
    import("./userStore").then(({ useUserStore }) => {
      useUserStore.getState().setUserWorkspace(workspaceId)
    })
  },
  //#endregion

  //#region ----- LOAD CURRENT WORKSPACE -----
  loadCurrentWorkspace: () => {
    const storedId = localStorage.getItem("currentWorkspaceId")
    if (storedId) {
      set({ currentWorkspaceId: storedId })
    }
  },
  //#endregion

  //#region ----- CREATE INVITATION LINK -----
  createInvitationLink: async (workspaceId: string, teamId?: string) => {
    set({ loading: true, error: null, message: null })
    try {
      const token = getToken()
      if (!token) throw new Error("Missing access token")

      const url = teamId
        ? `${baseUrl}/workspace/${workspaceId}/teams/${teamId}/invite`
        : `${baseUrl}/workspace/${workspaceId}/invite`

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create invitation link")
      }

      const data = await response.json()
      set({
        loading: false,
        error: null,
        message: `Invitation link created: ${data.signupLink}`,
      })
      return data.signupLink
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create invitation link"
      set({ error: errorMessage, loading: false, message: null })
      return null
    }
  },

  //#region ----- VALIDATE INVITATION TOKEN -----
  validateInvitationToken: async (token: string) => {
    set({ loading: true, error: null, message: null })
    try {
      const response = await fetch(`${baseUrl}/invitation/validate/${token}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        set({ loading: false, error: "Invalid invitation token", message: null })
        return false
      }

      const data = await response.json()
      set({ loading: false, error: null, message: null })
      return data.valid === true
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to validate invitation token"
      set({ error: errorMessage, loading: false, message: null })
      return false
    }
  },

  //#region ----- CLEAR WORKSPACE DATA -----
  clearWorkspaceData: () => {
    localStorage.removeItem("currentWorkspaceId")
    set({
      workspaces: [],
      workspace: null,
      currentWorkspaceId: null,
      loading: false,
      error: null,
      message: null,
    })
  },
  //#endregion
}))
//#endregion
