import { Request, Response } from "express";
import { CommentModel } from "../models/Comment";

export const patchComment = async (req: Request, res: Response) => {
  const { commentId } = req.params;
  const { newContent } = req.body;

  try {
    const comment = await CommentModel.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        response: null,
        message: "The comment was not found"
      });
    }

    comment.content = newContent;
    const updatedComment = await comment.save();

    res.status(200).json({
      success: true,
      response: updatedComment,
      message: "The comment was successfully changed"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      response: error instanceof Error ? error.message : "Unknown error",
      message: "Could not change comment in the database"
    });
  }
};