import { create } from "zustand";

// Project type
export interface ProjectType {
  projectId: number;
  projectName: string;
  projectDescription: string;
  video: string;
}

// Store interface
interface ProjectsStore {
  projects: ProjectType[];
  addProject: (newProject: ProjectType) => void;
}

const STORAGE_KEY = "projectStore";

// Load from localStorage
const loadProjectsFromStorage = (): ProjectType[] => {
  if (typeof window === "undefined") return [];

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];

  try {
    const parsed = JSON.parse(stored) as ProjectType[];
    return parsed.map((item) => ({
      projectId: item.projectId,
      projectName: item.projectName,
      projectDescription: item.projectDescription,
      video: item.video,
    }));
  } catch {
    return [];
  }
};

// Zustand store with persistence
export const useProjectStore = create<ProjectsStore>((set) => ({
  projects: loadProjectsFromStorage(),

  addProject: (newProject: ProjectType) =>
    set((state) => {
      const updatedProjects = [...state.projects, newProject];
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProjects));
      }
      return { projects: updatedProjects };
    }),
}));