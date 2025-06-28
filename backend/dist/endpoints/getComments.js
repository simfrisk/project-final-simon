"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getComments = void 0;
const Comment_1 = require("../models/Comment");
const getComments = async (req, res) => {
    const { projectId } = req.params; // get projectId from URL
    try {
        const comments = await Comment_1.CommentModel.find({ projectId }); // find comments for that project
        return res.status(200).json({
            success: true,
            response: comments,
            message: "Comments fetched successfully",
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            response: null,
            message: "Failed to fetch comments",
        });
    }
};
exports.getComments = getComments;
