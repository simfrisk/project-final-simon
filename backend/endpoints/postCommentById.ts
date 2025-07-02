import { Project } from "../models/Projects";
import { CommentModel } from "../models/Comment";
import { Request, Response } from "express";
import { Types } from "mongoose";

export const postCommentById = async (req: Request, res: Response): Promise<Response> => {
  const { projectId } = req.params;
  const { content, timeStamp } = req.body;

  if (!content || !timeStamp) {
    return res.status(400).json({
      success: false,
      response: null,
      message: "Comment text and timestamp are required",
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

    const newComment = new CommentModel({
      content,
      projectId: project._id,
      createdAt: new Date(),
      timeStamp,
      replies: [],
    });

    await newComment.save();

    project.comments.push(newComment._id as Types.ObjectId);
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