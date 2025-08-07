import { Request, Response } from "express";
import { Types } from "mongoose";
import { Project } from "../models/Projects";
import { CommentModel } from "../models/Comment";

export const postCommentById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { projectId } = req.params;
  const { content, timeStamp, commentType } = req.body;

  // Validate required fields
  if (!content || !timeStamp || !commentType) {
    return res.status(400).json({
      success: false,
      response: null,
      message: "Comment text, timestamp, and comment type are required",
    });
  }

  try {
    // Find the project
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        response: null,
        message: "Project not found",
      });
    }

    // Create a new comment
    const newComment = new CommentModel({
      content,
      projectId: project._id,
      createdAt: new Date(),
      timeStamp,
      isChecked: false,
      commentCreatedBy: req.user?._id,
      commentType,
      replies: [],
      likes: [],
    });

    // Save the comment
    await newComment.save();

    // Populate the commentCreatedBy field before returning
    await newComment.populate("commentCreatedBy", "name profileImage role");

    // Add comment to the project
    project.comments.push(newComment._id as Types.ObjectId);
    await project.save();

    // Respond with success and populated comment
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