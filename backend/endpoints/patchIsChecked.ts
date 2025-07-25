import { Request, Response } from "express";
import { CommentModel } from "../models/Comment";

export const patchIsChecked = async (req: Request, res: Response): Promise<Response> => {
  const { commentId } = req.params;

  try {
    const comment = await CommentModel.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        response: null,
        message: "Comment not found",
      });
    }

    comment.isChecked = !comment.isChecked;
    await comment.save();

    return res.status(200).json({
      success: true,
      response: comment,
      message: "Comment check status toggled successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      response: null,
      message: "Failed to toggle comment check status",
    });
  }
};