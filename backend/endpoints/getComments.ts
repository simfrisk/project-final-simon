import { Request, Response } from "express";
import { CommentModel } from "../models/Comment";

export const getComments = async (req: Request, res: Response): Promise<Response> => {
  const { projectId } = req.params;

  try {
    const comments = await CommentModel.find({ projectId })
      .populate("replies")
      .populate("commentCreatedBy", "name profileImage");
    return res.status(200).json({
      success: true,
      response: comments,
      message: "Comments fetched successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      response: null,
      message: "Failed to fetch comments",
    });
  }
};