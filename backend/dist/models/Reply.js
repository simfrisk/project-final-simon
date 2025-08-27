"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Reply = void 0;
const mongoose_1 = require("mongoose");
const ReplySchema = new mongoose_1.Schema({
    content: { type: String, required: true, maxlength: 500, trim: true },
    commentId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Comment", required: true },
    createdAt: { type: Date, default: Date.now },
    isChecked: { type: Boolean, required: true },
    replyCreatedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    replyLikes: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User", default: [] }],
});
exports.Reply = (0, mongoose_1.model)("Reply", ReplySchema);
