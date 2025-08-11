import { Types } from "mongoose"
import { CommentModel } from "../models/Comment";
import { Reply } from "../models/Reply";
import { Request, Response } from "express";

/**
 * @swagger
 * /comments/{commentId}/replies:
 *   post:
 *     summary: Add a reply to a specific comment
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the comment to reply to
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 example: "This is a reply to the comment."
 *     responses:
 *       201:
 *         description: Reply added successfully
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
 *                   properties:
 *                     _id:
 *                       type: string
 *                     content:
 *                       type: string
 *                     commentId:
 *                       type: string
 *                     isChecked:
 *                       type: boolean
 *                     replyCreatedBy:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         profileImage:
 *                           type: string
 *                         role:
 *                           type: string
 *                     replyLikes:
 *                       type: array
 *                       items:
 *                         type: string
 *                 message:
 *                   type: string
 *                   example: "Reply added to comment"
 *       400:
 *         description: Missing reply content
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 response:
 *                   nullable: true
 *                 message:
 *                   type: string
 *                   example: "Reply content is required"
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
 *                   nullable: true
 *                 message:
 *                   type: string
 *                   example: "Comment not found"
 *       500:
 *         description: Server error while adding reply
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 response:
 *                   nullable: true
 *                 message:
 *                   type: string
 *                   example: "Could not add reply"
 */
export const postReplyById = async (req: Request, res: Response): Promise<Response> => {
  const { commentId } = req.params;
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({
      success: false,
      response: null,
      message: "Reply content is required",
    });
  }

  try {

    const comment = await CommentModel.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        response: null,
        message: "Comment not found",
      });
    }

    const newReply = new Reply({
      content,
      commentId: comment._id,
      isChecked: false,
      replyCreatedBy: req.user?._id,
      replyLikes: [],

    });

    await newReply.save();

    await newReply.populate("replyCreatedBy", "name profileImage role");

    comment.replies.push(newReply._id as Types.ObjectId);
    await comment.save();

    return res.status(201).json({
      success: true,
      response: newReply,
      message: "Reply added to comment",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      response: null,
      message: "Could not add reply",
    });
  }
};