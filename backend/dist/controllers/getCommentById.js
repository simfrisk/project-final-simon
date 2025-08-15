"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCommentById = void 0;
const Comment_1 = require("../models/Comment");
/**
 * @swagger
 * /comments/{commentId}:
 *   get:
 *     summary: Get a comment by its ID
 *     tags:
 *       - Comments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the comment to retrieve
 *     responses:
 *       200:
 *         description: Comment found
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
 *                       example: "64c1f2a3b9f1e1234567890c"
 *                     commentText:
 *                       type: string
 *                       example: "This is a comment."
 *                     commentType:
 *                       type: string
 *                       example: "question"
 *                     projectId:
 *                       type: string
 *                       example: "64c1f2a3b9f1e1234567890b"
 *                     commentCreatedBy:
 *                       type: string
 *                       example: "64c1f2a3b9f1e1234567890f"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-08-10T14:48:00.000Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-08-10T14:48:00.000Z"
 *                 message:
 *                   type: string
 *                   example: "Comment found"
 *       404:
 *         description: Comment was not found
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
 *                   example: "Comment was not found"
 *       500:
 *         description: Comment could not be fetched
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 response:
 *                   type: string
 *                   example: "Error details here"
 *                 message:
 *                   type: string
 *                   example: "Comment could not be fetched"
 */
const getCommentById = async (req, res) => {
    const { commentId } = req.params;
    try {
        const comment = await Comment_1.CommentModel.findById({ commentId, commentType: "question" });
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
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            response: error,
            message: "Comment could not be fetched",
        });
    }
};
exports.getCommentById = getCommentById;
