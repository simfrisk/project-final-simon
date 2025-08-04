"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteClass = void 0;
const Comment_1 = require("../models/Comment");
const Reply_1 = require("../models/Reply");
const Projects_1 = require("../models/Projects");
const Class_1 = require("../models/Class");
const deleteClass = async (req, res) => {
    const { classId } = req.params;
    try {
        const foundClass = await Class_1.ClassModel.findById(classId);
        if (!foundClass) {
            return res.status(404).json({
                success: false,
                response: null,
                message: "Class could not be found",
            });
        }
        // Step 1: Find all comments for this class
        const comments = await Comment_1.CommentModel.find({ classId });
        // Step 2: Delete all replies related to the comments
        const commentIds = comments.map(comment => comment._id);
        await Reply_1.Reply.deleteMany({ commentId: { $in: commentIds } });
        // Step 3: Delete comments
        await Comment_1.CommentModel.deleteMany({ classId });
        // Step 4: Delete projects associated with this class
        if (foundClass.projects && foundClass.projects.length > 0) {
            await Projects_1.Project.deleteMany({ _id: { $in: foundClass.projects } });
        }
        // Step 5: Delete the class
        await foundClass.deleteOne();
        return res.status(200).json({
            success: true,
            response: foundClass,
            message: "Class, its projects, comments, and replies were deleted",
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            response: error,
            message: "Could not delete class",
        });
    }
};
exports.deleteClass = deleteClass;
