"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postCommentById = void 0;
const Projects_1 = require("../models/Projects");
const postCommentById = async (req, res) => {
    const { projectId } = req.params;
    const { message, timeStamp } = req.body; // Accept timeStamp from client
    if (!message) {
        return res.status(400).json({
            success: false,
            response: null,
            message: "Comment text is required",
        });
    }
    if (!timeStamp) {
        return res.status(400).json({
            success: false,
            response: null,
            message: "Timestamp is required",
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
        const newComment = {
            message,
            createdAt: new Date(),
            timeStamp,
            replies: [], // initialize replies array
        };
        project.comments.push(newComment);
        await project.save();
        return res.status(201).json({
            success: true,
            response: newComment,
            message: "Comment added to project",
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            response: error,
            message: "Could not add comment",
        });
    }
};
exports.postCommentById = postCommentById;
