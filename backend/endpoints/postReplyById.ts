import { Project } from "../models/Projects";
import { Request, Response } from "express";

interface Reply {
  reply: string;
  createdAt: Date;
}

export const postReplyById = async (req: Request, res: Response): Promise<Response> => {
  const { projectId, commentId } = req.params;
  const { reply } = req.body;

  if (!reply) {
    return res.status(400).json({
      success: false,
      response: null,
      message: "Reply text is required",
    });
  }

  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        response: null,
        message: "Project not found",
      });
    }

    // Convert commentId to a number if your schema uses numeric IDs, or to ObjectId if you're using MongoDB ObjectId
    const comment = project.comments.id(commentId); // works if comments are subdocs with ObjectId
    if (!comment) {
      return res.status(404).json({
        success: false,
        response: null,
        message: "Comment not found",
      });
    }

    const newReply: Reply = {
      reply,
      createdAt: new Date(),
    };

    comment.replies.push(newReply);
    await project.save();

    return res.status(201).json({
      success: true,
      response: newReply,
      message: "Reply added to comment",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      response: error,
      message: "Could not add reply",
    });
  }
};