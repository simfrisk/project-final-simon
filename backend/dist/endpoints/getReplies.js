"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReplies = void 0;
const Reply_1 = require("../models/Reply");
const getReplies = async (req, res) => {
    const { commentId } = req.params;
    try {
        const replies = await Reply_1.Reply.find({ commentId }); // Find replies linked to this comment
        return res.status(200).json({
            success: true,
            response: replies,
            message: "Replies fetched successfully",
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            response: null,
            message: "Failed to fetch replies",
        });
    }
};
exports.getReplies = getReplies;
