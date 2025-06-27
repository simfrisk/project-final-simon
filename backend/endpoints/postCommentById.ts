import { Project } from "../models/Projects";
import { Comment } from "../models/comment";
import { Request, Response } from "express";

interface Reply {
  reply: string;
  createdAt: Date;
}

interface Comment {
  message: string;
  createdAt: Date;
  timeStamp: string;
  replies: Reply[];
}

export const postCommentById = async (req: Request, res: Response): Promise<Response> => {
  const { projectId } = req.params;
  const { message, timeStamp } = req.body;  // Accept timeStamp from client

  if (!message) {
    return res.status(400).json({
      success: false,
      response: null,
      message: "Comment text is required",
    });
  }

  if (!timeStamp) {
    return res.status(400).json({
      success: false,
      response: null,
      message: "Timestamp is required",
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

    const newComment: Comment = {
      message,
      createdAt: new Date(),
      timeStamp,
      replies: [],  // initialize replies array
    };

    project.comments.push(newComment);
    await project.save();

    return res.status(201).json({
      success: true,
      response: newComment,
      message: "Comment added to project",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      response: error,
      message: "Could not add comment",
    });
  }
};