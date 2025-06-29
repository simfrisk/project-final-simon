"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCommentById = void 0;
const Comment_1 = require("../models/Comment"); // import your actual Comment model
const getCommentById = async (req, res) => {
    const { commentId } = req.params;
    try {
        const comment = await Comment_1.CommentModel.findById(commentId);
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
