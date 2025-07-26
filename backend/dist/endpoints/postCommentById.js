"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postCommentById = void 0;
const Projects_1 = require("../models/Projects");
const Comment_1 = require("../models/Comment");
const postCommentById = async (req, res) => {
    const { projectId } = req.params;
    const { content, timeStamp } = req.body;
    // Validate required fields
    if (!content || !timeStamp) {
        return res.status(400).json({
            success: false,
            response: null,
            message: "Comment text and timestamp are required",
        });
    }
    try {
        // Find the project
        const project = await Projects_1.Project.findById(projectId);
        if (!project) {
            return res.status(404).json({
                success: false,
                response: null,
                message: "Project not found",
            });
        }
        // Create a new comment
        const newComment = new Comment_1.CommentModel({
            content,
            projectId: project._id,
            createdAt: new Date(),
            timeStamp,
            isChecked: false,
            commentCreatedBy: req.user?._id,
            replies: [],
        });
        // Save the comment
        await newComment.save();
        // Add comment to the project
        project.comments.push(newComment._id);
        await project.save();
        // Respond with success
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
