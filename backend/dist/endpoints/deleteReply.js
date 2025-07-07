"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReply = void 0;
const Reply_1 = require("../models/Reply");
const deleteReply = async (req, res) => {
    const { replyId } = req.params;
    try {
        const reply = await Reply_1.Reply.findById(replyId);
        if (!reply) {
            return res.status(404).json({
                success: false,
                response: null,
                message: "Reply could not be found"
            });
        }
        await reply.deleteOne();
        return res.status(200).json({
            success: true,
            response: reply,
            message: "The reply was deleted"
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            response: error,
            message: "Could not delete reply"
        });
    }
};
exports.deleteReply = deleteReply;
