"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentModel = void 0;
const mongoose_1 = require("mongoose");
const CommentSchema = new mongoose_1.Schema({
    content: { type: String, required: true },
    projectId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Project", required: true },
    createdAt: { type: Date, default: Date.now },
    timeStamp: String,
    replies: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Reply" }],
});
exports.CommentModel = (0, mongoose_1.model)("Comment", CommentSchema);
