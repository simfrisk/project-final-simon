"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postReplyById = void 0;
const Projects_1 = require("../models/Projects");
const Comment_1 = require("../models/Comment");
const Reply_1 = require("../models/Reply");
const postReplyById = async (req, res) => {
    const { projectId, commentId } = req.params;
    const { reply } = req.body;
    if (!reply) {
        return res.status(400).json({
            success: false,
            response: null,
            message: "Reply text is required",
        });
    }
    try {
        const project = await Projects_1.Project.findById(projectId);
        if (!project) {
            return res.status(404).json({
                success: false,
                response: null,
                message: "Project not found",
            });
        }
        const comment = await Comment_1.CommentModel.findById(commentId);
        if (!comment) {
            return res.status(404).json({
                success: false,
                response: null,
                message: "Comment not found",
            });
        }
        // Create and save the reply
        const newReply = new Reply_1.Reply({
            content: reply,
            commentId: comment._id,
            createdAt: new Date(),
        });
        await newReply.save();
        // Push reply _id to comment
        comment.replies.push(newReply._id);
        await comment.save(); // ✅ You forgot this line
        return res.status(201).json({
            success: true,
            response: newReply,
            message: "Reply added to comment",
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            response: error,
            message: "Could not add reply",
        });
    }
};
exports.postReplyById = postReplyById;
