"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllComments = void 0;
const Comment_1 = require("../models/Comment");
const getAllComments = async (req, res) => {
    try {
        console.log("📥 GET /comments/all called");
        const comments = await Comment_1.CommentModel.find();
        console.log("📤 Comments fetched:", comments.length);
        return res.status(200).json({
            success: true,
            response: comments,
            message: "All comments fetched successfully",
        });
    }
    catch (error) {
        console.error("❌ Error in /comments/all:", error);
        return res.status(500).json({
            success: false,
            response: null,
            message: "Failed to fetch comments",
        });
    }
};
exports.getAllComments = getAllComments;
