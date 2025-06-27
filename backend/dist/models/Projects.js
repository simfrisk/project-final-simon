"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Project = void 0;
const mongoose_1 = require("mongoose");
const ReplySchema = new mongoose_1.Schema({
    reply: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});
const CommentSchema = new mongoose_1.Schema({
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    timeStamp: { type: String },
    replies: [ReplySchema],
});
const ProjectSchema = new mongoose_1.Schema({
    projectName: { type: String, required: true },
    projectDescription: String,
    video: String,
    comments: { type: [CommentSchema], default: [] },
});
exports.Project = (0, mongoose_1.model)("Project", ProjectSchema);
