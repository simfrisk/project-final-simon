import { Request, Response } from "express";
import { CommentModel } from "../models/Comment";

/**
 * @swagger
 * /comments/{commentId}/isChecked:
 *   patch:
 *     summary: Toggle the isChecked status of a comment by ID
 *     tags:
 *       - Comments
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the comment to toggle isChecked
 *     responses:
 *       200:
 *         description: Comment isChecked status toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 response:
 *                   type: object
 *                   description: Updated comment object with populated replies and creator info
 *                 message:
 *                   type: string
 *                   example: Comment check status toggled successfully
 *       404:
 *         description: Comment not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 response:
 *                   type: null
 *                 message:
 *                   type: string
 *                   example: Comment not found
 *       500:
 *         description: Server error toggling comment check status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 response:
 *                   type: null
 *                 message:
 *                   type: string
 *                   example: Failed to toggle comment check status
 */
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
    const updatedComment = await CommentModel.findById(commentId)
      .populate({
        path: "replies",
        select: "replyCreatedBy replyLikes content createdAt",
        populate: {
          path: "replyCreatedBy",
          select: "name profileImage role"
        }
      })
      .populate("commentCreatedBy", "name profileImage role");

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