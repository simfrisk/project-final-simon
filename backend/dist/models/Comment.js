"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentModel = void 0;
const mongoose_1 = require("mongoose");
const CommentSchema = new mongoose_1.Schema({
    content: { type: String, required: true, maxlength: 500, trim: true },
    projectId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Project", required: true },
    createdAt: { type: Date, default: Date.now },
    timeStamp: String,
    isChecked: { type: Boolean, required: true, default: false },
    replies: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Reply" }],
    commentCreatedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    commentType: {
        type: String,
        enum: ["question", "public", "private"],
        required: true,
    },
    likes: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User", default: [] }],
});
exports.CommentModel = (0, mongoose_1.model)("Comment", CommentSchema);
