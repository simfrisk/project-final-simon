"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.patchReply = void 0;
const Reply_1 = require("../models/Reply");
const patchReply = async (req, res) => {
    const { replyId } = req.params;
    const { newContent } = req.body;
    try {
        const reply = await Reply_1.Reply.findById(replyId);
        if (!reply) {
            return res.status(404).json({
                success: false,
                response: null,
                message: "The message was not found"
            });
        }
        reply.content = newContent;
        const updatedReply = await reply.save();
        res.status(200).json({
            success: true,
            response: updatedReply,
            message: "The reply was successfully changed"
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            response: error instanceof Error ? error.message : "Unknown error",
            message: "Could not change reply in the database"
        });
    }
};
exports.patchReply = patchReply;
