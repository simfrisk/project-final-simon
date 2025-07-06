import { create } from "zustand";

export interface ProjectType {
  _id?: string;
  projectName: string;
  projectDescription: string;
  video: string;
  comments?: any[]; // optionally type your comments
}

interface ProjectsStore {
  projects: ProjectType[];
  project: ProjectType | null; // 👈 single project view
  loading: boolean;
  error: string | null;
  message: string | null;

  fetchProjects: () => Promise<void>;
  fetchProjectById: (projectId: string) => Promise<void>;
  addProject: (newProject: ProjectType) => void;
}

export const useProjectStore = create<ProjectsStore>((set) => ({
  projects: [],
  project: null, // 👈 initialize single project
  loading: false,
  error: null,
  message: null,

  fetchProjects: async () => {
    set({ loading: true, error: null, message: null });
    try {
      const response = await fetch("https://final-project.onrender.com/projects");
      if (!response.ok) throw new Error("Network response was not ok");

      const json = await response.json();
      console.log(json)

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
          error: json.message || "Failed to fetch projects",
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
      const response = await fetch(`https://final-project.onrender.com/projects/${projectId}`);
      if (!response.ok) throw new Error("Network response was not ok");

      const json = await response.json();
      console.log(json)

      if (json.success) {
        set({
          project: json.response, // 👈 set single project here
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

  addProject: async (newProject) => {
    set({ loading: true, error: null, message: null });
    try {
      const res = await fetch("https://final-project.onrender.com/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProject),
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
}));