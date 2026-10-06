//#region ----- IMPORTS -----
import { create } from "zustand"
import { getToken } from "../utils/token"
import { baseUrl } from "../config/api"
import { uploadMedia, abortUpload } from "../utils/upload/uploadMedia"
import type { UploadedMediaRef } from "../utils/upload/types"

//#endregion

//#region ----- INTERFACES -----
export interface UserType {
  _id: string
  name: string
  email: string
  profileImage?: string | null
}

export interface ProjectType {
  _id?: string
  classId: string
  projectName: string
  projectDescription: string
  teacher: string
  video: string | File | null
  thumbnail?: string
  projectCreatedBy?: UserType
  comments?: any[]
}

export interface AddProjectResult {
  success: boolean
  cancelled: boolean
  message: string
}

interface ProjectsStore {
  projects: ProjectType[]
  project: ProjectType | null
  loading: boolean
  error: string | null
  message: string | null
  // Fraction 0..1 while a video is uploading, null otherwise.
  uploadProgress: number | null

  fetchProjects: (classId: string) => Promise<void>
  fetchProjectsWithComments: () => Promise<void>
  fetchProjectById: (projectId: string) => Promise<void>
  addProject: (classId: string, newProject: ProjectType) => Promise<AddProjectResult>
  cancelUpload: () => void
  deleteProject: (projectId: string) => Promise<void>
  updateProject: (
    projectId: string,
    updates: { newName?: string; newDescription?: string; newTeacher?: string }
  ) => Promise<void>
  clearProjects: () => void
}

//#endregion

//#region ----- UPLOAD CANCELLATION -----
// Held outside the store state because an AbortController is not render data.
let uploadController: AbortController | null = null
//#endregion

//#region ----- ZUSTAND PROJECT STORE -----
export const useProjectStore = create<ProjectsStore>((set) => ({
  projects: [],
  project: null,
  loading: false,
  error: null,
  message: null,
  uploadProgress: null,

  //#endregion

  //#region ----- FETCH PROJECTS -----
  fetchProjects: async (classId: string) => {
    set({ loading: true, error: null, message: null })
    try {
      const token = getToken()
      if (!token) throw new Error("Missing access token")

      const response = await fetch(`${baseUrl}/classes/${classId}/projects`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      })

      if (!response.ok) throw new Error("Network response was not ok")

      const json = await response.json()

      if (json.success) {
        set({
          projects: json.response,
          loading: false,
          error: null,
          message: json.message || "Projects fetched successfully",
        })
      } else {
        set({
          loading: false,
          error: json.message || "Failed to fetch the projects",
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

  //#region ----- FETCH PROJECT WITH COMMETNS -----
  fetchProjectsWithComments: async () => {
    set({ loading: true, error: null, message: null })
    try {
      const token = getToken()
      if (!token) throw new Error("Missing access token")

      const response = await fetch(`${baseUrl}/classes/projects/with-comments`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      })

      if (!response.ok) throw new Error("Network response was not ok")

      const json = await response.json()

      if (json.success) {
        set({
          projects: json.response,
          loading: false,
          error: null,
          message: json.message || "Projects with comments fetched successfully",
        })
      } else {
        set({
          loading: false,
          error: json.message || "Failed to fetch the projects with comments",
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

  //#region ----- FETCH PROJECT BY ID -----
  fetchProjectById: async (projectId: string) => {
    set({ loading: true, error: null, message: null })
    try {
      const token = getToken()
      if (!token) throw new Error("Missing access token")

      const response = await fetch(`${baseUrl}/projects/${projectId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      })

      if (!response.ok) throw new Error("Network response was not ok")

      const json = await response.json()

      if (json.success) {
        set({
          project: json.response,
          loading: false,
          error: null,
          message: json.message || "Project fetched successfully",
        })
      } else {
        set({
          loading: false,
          error: json.message || "Failed to fetch project",
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

  //#region ----- ADD PROJECT -----
  // The video goes straight to storage through uploadMedia, then the project is
  // created from a small JSON body that only references the uploaded file.
  // This does not use the shared `loading` flag: the library page swaps its whole
  // content for a spinner while that flag is set, which would remove the upload
  // form (and its progress bar and cancel button) mid-upload. Failures are returned
  // to the form instead of the shared `error` for the same reason.
  addProject: async (classId: string, newProject: ProjectType) => {
    set({ error: null, message: null, uploadProgress: null })

    let uploadedRef: UploadedMediaRef | null = null
    let token: string | null = null

    try {
      token = getToken()
      if (!token) throw new Error("Missing access token")

      if (newProject.video instanceof File) {
        uploadController = new AbortController()
        set({ uploadProgress: 0 })
        uploadedRef = await uploadMedia(newProject.video, "video", {
          token,
          signal: uploadController.signal,
          onProgress: (fraction) => set({ uploadProgress: fraction }),
        })
      }

      const res = await fetch(`${baseUrl}/classes/${classId}/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({
          projectName: newProject.projectName,
          projectDescription: newProject.projectDescription || "",
          teacher: newProject.teacher || "",
          ...(uploadedRef ? { video: uploadedRef } : {}),
        }),
      })

      const json = await res.json().catch(() => null)

      if (res.ok && json?.success) {
        set((state) => ({
          projects: [...state.projects, json.response],
          error: null,
          message: json.message,
        }))
        return { success: true, cancelled: false, message: json.message || "Project created" }
      }

      throw new Error(json?.message || json?.error || "Failed to add project")
    } catch (err: unknown) {
      // The file is in storage but no project points at it, so release it.
      if (uploadedRef && token) await abortUpload(uploadedRef, token)

      if (err instanceof DOMException && err.name === "AbortError") {
        set({ message: null })
        return { success: false, cancelled: true, message: "Upload cancelled" }
      }

      const message = err instanceof Error ? err.message : "Failed to add project"
      set({ message: null })
      return { success: false, cancelled: false, message }
    } finally {
      uploadController = null
      set({ uploadProgress: null })
    }
  },

  cancelUpload: () => {
    uploadController?.abort()
  },

  //#endregion

  //#region ----- DELETE PROJECT -----
  deleteProject: async (projectId: string) => {
    set({ loading: true, error: null, message: null })
    try {
      const token = getToken()
      if (!token) throw new Error("Missing access token")

      const response = await fetch(`${baseUrl}/projects/${projectId}`, {
        method: "DELETE",
        headers: {
          Authorization: token,
        },
      })

      if (!response.ok) throw new Error("Failed to delete project")

      const data = await response.json()

      if (data.success) {
        set((state) => ({
          projects: state.projects.filter((project) => project._id !== projectId),
          loading: false,
          message: data.message,
          error: null,
        }))
      } else {
        set({
          loading: false,
          error: data.message || "Failed to delete project",
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

  //#region ----- UPDATE PROJECT -----
  updateProject: async (
    projectId: string,
    updates: { newName?: string; newDescription?: string; newTeacher?: string }
  ) => {
    set({ loading: true, error: null, message: null })
    try {
      const token = getToken()
      if (!token) throw new Error("Missing access token")

      const response = await fetch(`${baseUrl}/projects/${projectId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) throw new Error("Failed to update project")

      const data = await response.json()

      if (data.success && data.response) {
        const updatedProject = data.response

        set((state) => ({
          projects: state.projects.map((p) =>
            p._id === projectId ? { ...p, ...updatedProject } : p
          ),
          project:
            state.project && state.project._id === projectId
              ? { ...state.project, ...updatedProject }
              : state.project,
          loading: false,
          error: null,
          message: data.message || "Project updated successfully",
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

  //#region ----- CLEAR PROJECTS -----

  clearProjects: () => {
    set({
      projects: [],
      project: null,
      loading: false,
      error: null,
      message: null,
    })
  },

  //#endregion
}))
