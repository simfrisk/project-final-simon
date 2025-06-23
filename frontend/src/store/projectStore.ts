import { create } from "zustand"

interface ProjectType {
  projectID: number,
  projectName: string
  video: string,
}

interface ProjectsStore {
  projects: ProjectType[]
}

export const useProjectStore = create<ProjectsStore>((set) => ({
  projects: [], // initial state

  addProject: (p: ProjectType) => {
    set((state) => {
      const newProjects = [...state.projects, p];
      return { projects: newProjects };
    });
  },
}));