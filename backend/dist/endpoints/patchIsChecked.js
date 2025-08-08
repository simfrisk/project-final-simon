"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.patchIsChecked = void 0;
const Comment_1 = require("../models/Comment");
const patchIsChecked = async (req, res) => {
    const { commentId } = req.params;
    try {
        const comment = await Comment_1.CommentModel.findById(commentId).populate("commentCreatedBy", "name profileImage role");
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
        const updatedComment = await Comment_1.CommentModel.findById(commentId)
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
    }
    catch (error) {
        console.error("Error toggling isChecked:", error);
        return res.status(500).json({
            success: false,
            response: null,
            message: "Failed to toggle comment check status",
        });
    }
};
exports.patchIsChecked = patchIsChecked;
