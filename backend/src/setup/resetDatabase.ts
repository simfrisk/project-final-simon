import mongoose, { Types } from "mongoose";
import { Project } from "../models/Projects";
import { CommentModel } from "../models/Comment";
import { Reply } from "../models/Reply";
import data from "../data.json";

export const resetDatabase = async () => {
  if (!process.env.RESET_DB) return;

  console.log("🌱 Resetting and seeding database...");

  try {
    await Reply.deleteMany({});
    await CommentModel.deleteMany({});
    await Project.deleteMany({});

    // Step 1: Insert Projects and keep saved documents
    const savedProjects = [];
    for (const project of data.projects) {
      const savedProject = await new Project(project).save();
      savedProjects.push(savedProject);
    }
    console.log(`Saved ${savedProjects.length} projects.`);

    // Step 2: Insert Comments with correct projectId and keep saved comments
    const savedComments = [];
    for (const comment of data.comments) {
      if (
        comment.projectIndex === undefined ||
        comment.projectIndex < 0 ||
        comment.projectIndex >= savedProjects.length
      ) {
        console.error(
          `Invalid projectIndex ${comment.projectIndex} for comment:`,
          comment
        );
        continue; // skip saving this comment
      }

      const projectId = savedProjects[comment.projectIndex]._id;
      if (!projectId) {
        console.error(
          `Missing projectId for comment at projectIndex ${comment.projectIndex}:`,
          comment
        );
        continue; // skip saving
      }

      const commentToSave = {
        content: comment.content,
        createdAt: new Date(comment.createdAt),
        timeStamp: comment.timeStamp,
        projectId,
        replies: [],
      };

      try {
        const savedComment = await new CommentModel(commentToSave).save();
        savedComments.push(savedComment);
      } catch (error) {
        console.error("Failed to save comment:", commentToSave, error);
      }
    }
    console.log(`Saved ${savedComments.length} comments.`);

    // Step 3: Insert Replies with correct commentId
    for (const reply of data.replies) {
      if (
        reply.commentIndex === undefined ||
        reply.commentIndex < 0 ||
        reply.commentIndex >= savedComments.length
      ) {
        console.error(
          `Invalid commentIndex ${reply.commentIndex} for reply:`,
          reply
        );
        continue; // skip saving this reply
      }

      const commentId = savedComments[reply.commentIndex]._id;
      if (!commentId) {
        console.error(
          `Missing commentId for reply at commentIndex ${reply.commentIndex}:`,
          reply
        );
        continue;
      }

      const replyToSave = {
        content: reply.content,
        createdAt: new Date(reply.createdAt),
        commentId,
      };

      try {
        const savedReply = await new Reply(replyToSave).save();

        // Add reply ID to the parent comment's replies array
        const parentComment = savedComments[reply.commentIndex];
        parentComment.replies.push(savedReply._id as Types.ObjectId);
        await parentComment.save();
      } catch (error) {
        console.error("Failed to save reply:", replyToSave, error);
      }
    }

    console.log("✅ Seeding complete.");
  } catch (error) {
    console.error("❌ Error during database reset:", error);
  }
};