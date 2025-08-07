"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postReplyById = void 0;
const Comment_1 = require("../models/Comment");
const Reply_1 = require("../models/Reply");
const postReplyById = async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;
    if (!content) {
        return res.status(400).json({
            success: false,
            response: null,
            message: "Reply content is required",
        });
    }
    try {
        const comment = await Comment_1.CommentModel.findById(commentId);
        if (!comment) {
            return res.status(404).json({
                success: false,
                response: null,
                message: "Comment not found",
            });
        }
        const newReply = new Reply_1.Reply({
            content,
            commentId: comment._id,
            isChecked: false,
            replyCreatedBy: req.user?._id,
            replyLikes: [],
        });
        await newReply.save();
        await newReply.populate("replyCreatedBy", "name profileImage role");
        comment.replies.push(newReply._id);
        await comment.save();
        return res.status(201).json({
            success: true,
            response: newReply,
            message: "Reply added to comment",
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            response: null,
            message: "Could not add reply",
        });
    }
};
exports.postReplyById = postReplyById;
