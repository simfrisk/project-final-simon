"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProject = void 0;
const Comment_1 = require("../models/Comment");
const Reply_1 = require("../models/Reply");
const Projects_1 = require("../models/Projects");
const deleteProject = async (req, res) => {
    const { projectId } = req.params;
    try {
        const project = await Projects_1.Project.findById(projectId);
        if (!project) {
            return res.status(404).json({
                success: false,
                response: null,
                message: "Project could not be found",
            });
        }
        // Step 1: Find all comments for this project
        const comments = await Comment_1.CommentModel.find({ projectId });
        // Step 2: Extract comment IDs to delete associated replies
        const commentIds = comments.map(comment => comment._id);
        await Reply_1.Reply.deleteMany({ commentId: { $in: commentIds } });
        // Step 3: Delete comments
        await Comment_1.CommentModel.deleteMany({ projectId });
        // Step 4: Delete the project itself
        await project.deleteOne();
        return res.status(200).json({
            success: true,
            response: project,
            message: "Project, its comments, and replies were deleted",
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            response: error,
            message: "Could not delete project",
        });
    }
};
exports.deleteProject = deleteProject;
