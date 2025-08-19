"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.patchComment = void 0;
const Comment_1 = require("../models/Comment");
/**
 * @swagger
 * /comments/{commentId}:
 *   patch:
 *     summary: Update a comment's content by ID
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
 *         description: The ID of the comment to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newContent
 *             properties:
 *               newContent:
 *                 type: string
 *                 example: Updated comment content here
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 response:
 *                   $ref: '#/components/schemas/Comment'  # Assuming you have a Comment schema defined
 *                 message:
 *                   type: string
 *                   example: The comment was successfully changed
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
 *                   example: The comment was not found
 *       500:
 *         description: Server error updating comment
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
 *                   example: Could not change comment in the database
 *                 message:
 *                   type: string
 *                   example: Could not change comment in the database
 */
const patchComment = async (req, res) => {
    const { commentId } = req.params;
    const { newContent } = req.body;
    try {
        const comment = await Comment_1.CommentModel.findById(commentId);
        if (!comment) {
            return res.status(404).json({
                success: false,
                response: null,
                message: "The comment was not found",
            });
        }
        comment.content = newContent;
        const updatedComment = await comment.save();
        res.status(200).json({
            success: true,
            response: updatedComment,
            message: "The comment was successfully changed",
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            response: error instanceof Error ? error.message : "Unknown error",
            message: "Could not change comment in the database",
        });
    }
};
exports.patchComment = patchComment;
