import { Request, Response } from "express";
import { Reply } from "../models/Reply";
import { Types } from "mongoose";

/**
 * @swagger
 * /replies/{replyId}/like:
 *   post:
 *     summary: Toggle like on a reply by authenticated user
 *     tags:
 *       - Replies
 *     security:                   
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: replyId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Like toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 liked:
 *                   type: boolean
 *                   description: Whether the reply is liked after the toggle
 *                   example: true
 *                 totalLikes:
 *                   type: integer
 *                   example: 3
 *                 message:
 *                   type: string
 *                   example: "Reply liked"
 *       401:
 *         description: User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "User not authenticated"
 *       404:
 *         description: Reply not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Reply not found"
 *       500:
 *         description: Server error toggling like
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Error toggling like"
 */
export const postReplyLike = async (req: Request, res: Response): Promise<Response> => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "User not authenticated",
    });
  }

  const { replyId } = req.params;

  try {
    const reply = await Reply.findById(replyId);
    if (!reply) {
      return res.status(404).json({
        success: false,
        message: "Reply not found",
      });
    }

    const hasLiked = reply.replyLikes.includes(user._id);

    if (hasLiked) {
      // Unlike
      reply.replyLikes = reply.replyLikes.filter(id => id.toString() !== user._id.toString());
      user.likedReplies = user.likedReplies.filter(id => id.toString() !== reply._id.toString());
    } else {
      // Like
      reply.replyLikes.push(user._id as Types.ObjectId);
      user.likedReplies.push(reply._id as Types.ObjectId);
    }

    await reply.save();
    await user.save();

    return res.status(200).json({
      success: true,
      liked: !hasLiked,
      totalLikes: reply.replyLikes.length,
      message: hasLiked ? "Reply unliked" : "Reply liked",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error toggling like",
    });
  }
};