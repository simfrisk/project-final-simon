"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postReplyLike = void 0;
const Reply_1 = require("../models/Reply");
const postReplyLike = async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({
            success: false,
            message: "User not authenticated",
        });
    }
    const { replyId } = req.params;
    try {
        const reply = await Reply_1.Reply.findById(replyId);
        if (!reply) {
            return res.status(404).json({
                success: false,
                message: "Reply not found",
            });
        }
        const hasLiked = reply.replyLikes.includes(user._id);
        if (hasLiked) {
            // Unlike
            reply.replyLikes = reply.replyLikes.filter(id => id.toString() !== user._id.toString());
            user.likedReplies = user.likedReplies.filter(id => id.toString() !== reply._id.toString());
        }
        else {
            // Like
            reply.replyLikes.push(user._id);
            user.likedReplies.push(reply._id); // ✅ FIXED
        }
        await reply.save();
        await user.save();
        return res.status(200).json({
            success: true,
            liked: !hasLiked,
            totalLikes: reply.replyLikes.length,
            message: hasLiked ? "Reply unliked" : "Reply liked",
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error toggling like",
        });
    }
};
exports.postReplyLike = postReplyLike;
