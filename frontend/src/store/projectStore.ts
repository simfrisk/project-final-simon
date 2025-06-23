import { create } from "zustand";

// Your Project type
export interface ProjectType {
  projectID: number;
  projectName: string;
  video: string;
}

// Store interface
interface ProjectsStore {
  projects: ProjectType[];
  addProject: (newProject: ProjectType) => void;
}

// Zustand store
export const useProjectStore = create<ProjectsStore>((set) => ({
  projects: [],

  addProject: (newProject: ProjectType) =>
    set((state) => ({
      projects: [...state.projects, newProject],
    })),
}));