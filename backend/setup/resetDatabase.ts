import { Project } from "../models/Projects";
import projectData from "../data.json"

export const resetDatabase = () => {
  if (process.env.RESET_DB) {
    const seedDatabase = async () => {
      console.log("🌱 Resetting and seeding database...");
      await Project.deleteMany({});
      projectData.forEach(project => {
        new Project(project).save();
      });
      console.log("✅ Seeding complete.");
    };
    seedDatabase();
  }
}