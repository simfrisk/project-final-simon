import { Request, Response } from "express";
import { CommentModel } from "../models/Comment";
import { Reply } from "../models/Reply";
import { Project } from "../models/Projects";

export const deleteComment = async (req: Request, res: Response) => {
  const { commentId } = req.params;

  try {
    const comment = await CommentModel.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        response: null,
        message: "Comment could not be found",
      });
    }

    // Delete all replies for this comment
    await Reply.deleteMany({ commentId: comment._id });

    // Remove the comment reference from the project
    await Project.updateOne(
      { _id: comment.projectId },
      { $pull: { comments: comment._id } }
    );

    // Delete the comment itself
    await comment.deleteOne();

    return res.status(200).json({
      success: true,
      response: comment,
      message: "Comment and its replies were deleted",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      response: error,
      message: "Could not delete comment",
    });
  }
};