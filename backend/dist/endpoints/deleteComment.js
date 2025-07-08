"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteComment = void 0;
const Comment_1 = require("../models/Comment");
const Reply_1 = require("../models/Reply");
const Projects_1 = require("../models/Projects");
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
        // Delete all replies for this comment
        await Reply_1.Reply.deleteMany({ commentId: comment._id });
        // Remove the comment reference from the project
        await Projects_1.Project.updateOne({ _id: comment.projectId }, { $pull: { comments: comment._id } });
        // Delete the comment itself
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
