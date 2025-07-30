"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPrivateComments = void 0;
const Comment_1 = require("../models/Comment");
const getPrivateComments = async (req, res) => {
    const { projectId } = req.params;
    const userId = req.user?._id; // or however your user ID is stored
    if (!userId) {
        return res.status(401).json({
            success: false,
            response: null,
            message: "Unauthorized: User ID not found",
        });
    }
    try {
        const comments = await Comment_1.CommentModel.find({
            projectId,
            commentType: "private",
            commentCreatedBy: userId,
        })
            .populate("replies")
            .populate("commentCreatedBy", "name profileImage role");
        return res.status(200).json({
            success: true,
            response: comments,
            message: "Private comments by user fetched successfully",
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            response: null,
            message: "Failed to fetch private comments",
        });
    }
};
exports.getPrivateComments = getPrivateComments;
