import { Request, Response } from "express";
import { Comment } from "../models/comment";

export const getComments = async (req: Request, res: Response): Promise<Response> => {
  const { projectId } = req.params;  // get projectId from URL

  try {
    const comments = await Comment.find({ projectId })  // find comments for that project

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