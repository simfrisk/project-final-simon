"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteComment = void 0;
const Comment_1 = require("../models/Comment");
const Reply_1 = require("../models/Reply");
const Projects_1 = require("../models/Projects");
/**
 * @swagger
 * /comments/{commentId}:
 *   delete:
 *     summary: Delete a comment and its replies
 *     tags:
 *       - Comments
 *     description: |
 *       Deletes a comment by ID along with all its replies. Only the comment owner or a teacher can delete the comment.
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the comment to delete
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Comment and its replies were deleted successfully
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
 *                   description: The deleted comment object
 *                 message:
 *                   type: string
 *                   example: Comment and its replies were deleted
 *       401:
 *         description: Unauthorized (user not logged in)
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
 *                   example: You must be logged in to delete a comment.
 *       403:
 *         description: Forbidden (user not owner or teacher)
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
 *                   example: You are not authorized to delete this comment
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
 *                   example: Comment could not be found
 *       500:
 *         description: Server error deleting comment
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 response:
 *                   type: object
 *                 message:
 *                   type: string
 *                   example: Could not delete comment
 */
const deleteComment = async (req, res) => {
    const { commentId } = req.params;
    try {
        const comment = await Comment_1.CommentModel.findById(commentId);
        if (!comment) {
            return res.status(404).json({
                success: false,
                response: null,
                message: "Comment could not be found",
            });
        }
        const user = req.user;
        if (!user || !user._id) {
            return res.status(401).json({
                success: false,
                message: "You must be logged in to delete a comment.",
            });
        }
        const isOwner = comment.commentCreatedBy.toString() === user._id.toString();
        const isTeacher = user.role === "teacher";
        if (!isOwner && !isTeacher) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to delete this comment",
            });
        }
        await Reply_1.Reply.deleteMany({ commentId: comment._id });
        await Projects_1.Project.updateOne({ _id: comment.projectId }, { $pull: { comments: comment._id } });
        await comment.deleteOne();
        return res.status(200).json({
            success: true,
            response: comment,
            message: "Comment and its replies were deleted",
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            response: error,
            message: "Could not delete comment",
        });
    }
};
exports.deleteComment = deleteComment;
