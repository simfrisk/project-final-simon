"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReplies = void 0;
const Reply_1 = require("../models/Reply");
/**
 * @swagger
 * /comments/{commentId}/replies:
 *   get:
 *     summary: Get all replies for a specific comment
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the comment to get replies for
 *     responses:
 *       200:
 *         description: Replies fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 response:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       replyText:
 *                         type: string
 *                       replyCreatedBy:
 *                         type: string
 *                       commentId:
 *                         type: string
 *                 message:
 *                   type: string
 *                   example: "Replies fetched successfully"
 *       500:
 *         description: Failed to fetch replies
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
 *                   example: null
 *                 message:
 *                   type: string
 *                   example: "Failed to fetch replies"
 */
const getReplies = async (req, res) => {
    const { commentId } = req.params;
    try {
        const replies = await Reply_1.Reply.find({ commentId }); // Find replies linked to this comment
        return res.status(200).json({
            success: true,
            response: replies,
            message: "Replies fetched successfully",
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            response: null,
            message: "Failed to fetch replies",
        });
    }
};
exports.getReplies = getReplies;
