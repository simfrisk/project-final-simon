"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.patchComment = void 0;
const Comment_1 = require("../models/Comment");
const patchComment = async (req, res) => {
    const { commentId } = req.params;
    const { newContent } = req.body;
    try {
        const comment = await Comment_1.CommentModel.findById(commentId);
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            response: error instanceof Error ? error.message : "Unknown error",
            message: "Could not change comment in the database"
        });
    }
};
exports.patchComment = patchComment;
