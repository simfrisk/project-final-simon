//#region ----- IMPORTS -----
import { create } from "zustand"
import { getToken } from "../utils/token"
import { baseUrl } from "../config/api"

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
  video: string | File | null
  thumbnail?: string
  projectCreatedBy?: UserType
  comments?: any[]
}

interface ProjectsStore {
  projects: ProjectType[]
  project: ProjectType | null
  loading: boolean
  error: string | null
  message: string | null

  fetchProjects: (classId: string) => Promise<void>
  fetchProjectsWithComments: () => Promise<void>
  fetchProjectById: (projectId: string) => Promise<void>
  addProject: (classId: string, newProject: ProjectType) => Promise<void>
  deleteProject: (projectId: string) => Promise<void>
  updateProject: (
    projectId: string,
    updates: { newName?: string; newDescription?: string }
  ) => Promise<void>
}

//#endregion

//#region ----- ZUSTAND PROJECT STORE -----
export const useProjectStore = create<ProjectsStore>((set) => ({
  projects: [],
  project: null,
  loading: false,
  error: null,
  message: null,

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

      const response = await fetch(
        `${baseUrl}/classes/projects/with-comments`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
        }
      )

      if (!response.ok) throw new Error("Network response was not ok")

      const json = await response.json()

      if (json.success) {
        set({
          projects: json.response,
          loading: false,
          error: null,
          message:
            json.message || "Projects with comments fetched successfully",
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
  addProject: async (classId: string, newProject: ProjectType) => {
    set({ loading: true, error: null, message: null })

    try {
      const token = getToken()
      if (!token) throw new Error("Missing access token")

      const formData = new FormData()
      formData.append("projectName", newProject.projectName)
      formData.append("projectDescription", newProject.projectDescription || "")
      if (newProject.video) {
        formData.append("video", newProject.video)
      }

      const res = await fetch(`${baseUrl}/classes/${classId}/projects`, {
        method: "POST",
        headers: {
          Authorization: token,
        },
        body: formData,
      })

      if (!res.ok) throw new Error("Failed to add project")

      const json = await res.json()

      if (json.success) {
        set((state) => ({
          projects: [...state.projects, json.response],
          loading: false,
          error: null,
          message: json.message,
        }))
      } else {
        set({
          loading: false,
          error: json.message || "Failed to add project",
          message: null,
        })
      }
    } catch (err: any) {
      set({ loading: false, error: err.message, message: null })
    }
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
          projects: state.projects.filter(
            (project) => project._id !== projectId
          ),
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
    updates: { newName?: string; newDescription?: string }
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
}))
