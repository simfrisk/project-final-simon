import { Request, Response } from "express";
import { CommentModel } from "../models/Comment";

export const patchIsChecked = async (req: Request, res: Response): Promise<Response> => {
  const { commentId } = req.params;

  try {
    const comment = await CommentModel.findById(commentId).populate(
      "commentCreatedBy",
      "name profileImage role"
    );

    if (!comment) {
      return res.status(404).json({
        success: false,
        response: null,
        message: "Comment not found",
      });
    }

    // Toggle isChecked
    comment.isChecked = !comment.isChecked;
    await comment.save();

    // Re-fetch the updated comment to ensure population
    const updatedComment = await CommentModel.findById(commentId).populate(
      "commentCreatedBy",
      "name profileImage role"
    );

    return res.status(200).json({
      success: true,
      response: updatedComment,
      message: "Comment check status toggled successfully",
    });
  } catch (error) {
    console.error("Error toggling isChecked:", error);
    return res.status(500).json({
      success: false,
      response: null,
      message: "Failed to toggle comment check status",
    });
  }
};