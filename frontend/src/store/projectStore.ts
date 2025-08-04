// store/projectStore.ts
import { create } from "zustand";
import { getToken } from "../utils/token";

export interface ProjectType {
  _id?: string;
  projectName: string;
  projectDescription: string;
  video: string | File | null;
  thumbnail?: string;
  comments?: any[];
}

interface ProjectsStore {
  projects: ProjectType[];
  project: ProjectType | null;
  loading: boolean;
  error: string | null;
  message: string | null;

  fetchProjects: (classId: string) => Promise<void>;
  fetchProjectsWithComments: () => Promise<void>;
  fetchProjectById: (projectId: string) => Promise<void>;
  addProject: (classId: string, newProject: ProjectType) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
}

export const useProjectStore = create<ProjectsStore>((set) => ({
  projects: [],
  project: null,
  loading: false,
  error: null,
  message: null,

  fetchProjects: async (classId: string) => {
    set({ loading: true, error: null, message: null });
    try {
      const token = getToken();
      if (!token) throw new Error("Missing access token");

      const response = await fetch(`https://project-final-simon.onrender.com/classes/${classId}/projects`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      });

      if (!response.ok) throw new Error("Network response was not ok");

      const json = await response.json();

      if (json.success) {
        set({
          projects: json.response,
          loading: false,
          error: null,
          message: json.message || "Projects fetched successfully",
        });
      } else {
        set({
          loading: false,
          error: json.message || "Failed to fetch the projects",
          message: null,
        });
      }
    } catch (err: any) {
      set({
        loading: false,
        error: err.message || "Unknown error",
        message: null,
      });
    }
  },

  fetchProjectsWithComments: async () => {
    set({ loading: true, error: null, message: null });
    try {
      const token = getToken();
      if (!token) throw new Error("Missing access token");

      const response = await fetch(`https://project-final-simon.onrender.com/classes/projects/with-comments`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      });

      if (!response.ok) throw new Error("Network response was not ok");

      const json = await response.json();

      if (json.success) {
        set({
          projects: json.response,
          loading: false,
          error: null,
          message: json.message || "Projects with comments fetched successfully",
        });
      } else {
        set({
          loading: false,
          error: json.message || "Failed to fetch the projects with comments",
          message: null,
        });
      }
    } catch (err: any) {
      set({
        loading: false,
        error: err.message || "Unknown error",
        message: null,
      });
    }
  },

  fetchProjectById: async (projectId: string) => {
    set({ loading: true, error: null, message: null });
    try {
      const token = getToken();
      if (!token) throw new Error("Missing access token");

      const response = await fetch(`https://project-final-simon.onrender.com/projects/${projectId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      });

      if (!response.ok) throw new Error("Network response was not ok");

      const json = await response.json();

      if (json.success) {
        set({
          project: json.response,
          loading: false,
          error: null,
          message: json.message || "Project fetched successfully",
        });
      } else {
        set({
          loading: false,
          error: json.message || "Failed to fetch project",
          message: null,
        });
      }
    } catch (err: any) {
      set({
        loading: false,
        error: err.message || "Unknown error",
        message: null,
      });
    }
  },

  addProject: async (classId: string, newProject: ProjectType) => {
    set({ loading: true, error: null, message: null });

    try {
      const token = getToken();
      if (!token) throw new Error("Missing access token");

      const formData = new FormData();
      formData.append("projectName", newProject.projectName);
      formData.append("projectDescription", newProject.projectDescription || "");
      if (newProject.video) {
        formData.append("video", newProject.video);
      }

      const res = await fetch(`https://project-final-simon.onrender.com/classes/${classId}/projects`, {
        method: "POST",
        headers: {
          Authorization: token,
        },
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to add project");

      const json = await res.json();

      if (json.success) {
        set((state) => ({
          projects: [...state.projects, json.response],
          loading: false,
          error: null,
          message: json.message,
        }));
      } else {
        set({ loading: false, error: json.message || "Failed to add project", message: null });
      }
    } catch (err: any) {
      set({ loading: false, error: err.message, message: null });
    }
  },

  deleteProject: async (projectId: string) => {
    set({ loading: true, error: null, message: null });
    try {
      const token = getToken();
      if (!token) throw new Error("Missing access token");

      const response = await fetch(`https://project-final-simon.onrender.com/projects/${projectId}`, {
        method: "DELETE",
        headers: {
          Authorization: token,
        },
      });

      if (!response.ok) throw new Error("Failed to delete project");

      const data = await response.json();

      if (data.success) {
        set((state) => ({
          projects: state.projects.filter((project) => project._id !== projectId),
          loading: false,
          message: data.message,
          error: null,
        }));
      } else {
        set({
          loading: false,
          error: data.message || "Failed to delete project",
          message: null,
        });
      }
    } catch (err: any) {
      set({
        loading: false,
        error: err.message || "Unknown error",
        message: null,
      });
    }
  },
}));