import { Request, Response } from "express";
import { CommentModel } from "../models/Comment";

/**
 * @swagger
 * /comments/{commentId}/toggle-check:
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