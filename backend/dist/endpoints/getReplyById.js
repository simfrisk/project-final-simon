"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReplyById = void 0;
const Reply_1 = require("../models/Reply");
const getReplyById = async (req, res) => {
    const { replyId } = req.params;
    try {
        const reply = await Reply_1.Reply.findById(replyId).populate({
            path: "commentId",
            select: "content projectId",
        });
        if (!reply) {
            return res.status(404).json({
                success: false,
                response: null,
                message: "Reply was not found",
            });
        }
        return res.status(200).json({
            success: true,
            response: reply,
            message: "Reply found",
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            response: error,
            message: "Could not retrieve reply",
        });
    }
};
exports.getReplyById = getReplyById;
