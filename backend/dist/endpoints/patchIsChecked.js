"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.patchIsChecked = void 0;
const Comment_1 = require("../models/Comment");
const patchIsChecked = async (req, res) => {
    const { commentId } = req.params;
    try {
        const comment = await Comment_1.CommentModel.findById(commentId);
        if (!comment) {
            return res.status(404).json({
                success: false,
                response: null,
                message: "Comment not found",
            });
        }
        comment.isChecked = !comment.isChecked;
        await comment.save();
        return res.status(200).json({
            success: true,
            response: comment,
            message: "Comment check status toggled successfully",
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            response: null,
            message: "Failed to toggle comment check status",
        });
    }
};
exports.patchIsChecked = patchIsChecked;
