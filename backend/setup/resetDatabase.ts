import mongoose from "mongoose";
import { Project } from "../models/Projects";
import { CommentModel } from "../models/Comment";
import { Reply } from "../models/Reply";
import data from "../data.json";

export const resetDatabase = () => {
  if (process.env.RESET_DB) {
    const seedDatabase = async () => {
      console.log("🌱 Resetting and seeding database...");

      await Reply.deleteMany({});
      await CommentModel.deleteMany({});
      await Project.deleteMany({});

      // Step 1: Insert Projects
      for (const project of data.projects) {
        await new Project(project).save();
      }

      // Step 2: Insert Comments
      for (const comment of data.comments) {
        await new CommentModel(comment).save(); // ✅
      }

      // Step 3: Insert Replies
      for (const reply of data.replies) {
        await new Reply(reply).save();
      }

      console.log("✅ Seeding complete.");
    };

    seedDatabase().catch((err) => {
      console.error("❌ Seeding error:", err);
    });
  }
};