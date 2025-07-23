import { Request, Response } from "express";
import { CommentModel } from "../models/Comment";

export const getAllComments = async (req: Request, res: Response): Promise<Response> => {
  try {
    const comments = await CommentModel.find();

    return res.status(200).json({
      success: true,
      response: comments,
      message: "All comments fetched successfully",
    });
  } catch (error) {
    console.error("❌ Error fetching all comments:", error);
    return res.status(500).json({
      success: false,
      response: null,
      message: "Failed to fetch comments",
    });
  }
};