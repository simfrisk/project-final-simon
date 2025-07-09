import { Request, Response } from "express";
import { CommentModel } from "../models/Comment";
import { Reply } from "../models/Reply";
import { Project } from "../models/Projects";

export const deleteProject = async (req: Request, res: Response) => {
  const { projectId } = req.params;

  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        response: null,
        message: "Project could not be found",
      });
    }

    // Step 1: Find all comments for this project
    const comments = await CommentModel.find({ projectId });

    // Step 2: Extract comment IDs to delete associated replies
    const commentIds = comments.map(comment => comment._id);
    await Reply.deleteMany({ commentId: { $in: commentIds } });

    // Step 3: Delete comments
    await CommentModel.deleteMany({ projectId });

    // Step 4: Delete the project itself
    await project.deleteOne();

    return res.status(200).json({
      success: true,
      response: project,
      message: "Project, its comments, and replies were deleted",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      response: error,
      message: "Could not delete project",
    });
  }
};