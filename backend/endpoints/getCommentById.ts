import { CommentModel } from "../models/Comment"; // import your actual Comment model
import { Request, Response } from "express";

export const getCommentById = async (req: Request, res: Response): Promise<Response> => {
  const { commentId } = req.params;

  try {
    const comment = await CommentModel.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        response: null,
        message: "Comment was not found",
      });
    }

    return res.status(200).json({
      success: true,
      response: comment,
      message: "Comment found",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      response: error,
      message: "Comment could not be fetched",
    });
  }
};