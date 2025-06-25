import { create } from "zustand";

export interface ProjectType {
  projectId: number;
  projectName: string;
  projectDescription: string;
  video: string;
}

interface ProjectsStore {
  projects: ProjectType[];
  loading: boolean;
  error: string | null;
  message: string | null;
  fetchProjects: () => Promise<void>;
  addProject: (newProject: ProjectType) => void;
}

export const useProjectStore = create<ProjectsStore>((set) => ({
  projects: [],
  loading: false,
  error: null,
  message: null,

  fetchProjects: async () => {
    set({ loading: true, error: null, message: null });

    try {
      const response = await fetch("http://localhost:8080/projects");
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
        // API returned success: false
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



  addProject: async (newProject) => {
    set({ loading: true, error: null, message: null });
    try {
      const res = await fetch("http://localhost:8080/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProject),
      });
      if (!res.ok) throw new Error("Failed to add project");
      const json = await res.json();

      if (json.success) {
        // Update the projects array with the newly added project (assuming json.response has it)
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