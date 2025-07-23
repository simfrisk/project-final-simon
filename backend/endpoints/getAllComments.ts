import { Request, Response } from "express";
import { CommentModel } from "../models/Comment";

export const getAllComments = async (req: Request, res: Response): Promise<Response> => {
  try {
    console.log("📥 GET /comments/all called");

    const comments = await CommentModel.find();
    console.log("📤 Comments fetched:", comments.length);

    return res.status(200).json({
      success: true,
      response: comments,
      message: "All comments fetched successfully",
    });
  } catch (error) {
    console.error("❌ Error in /comments/all:", error);
    return res.status(500).json({
      success: false,
      response: null,
      message: "Failed to fetch comments",
    });
  }
};