"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Project = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const ReplySchema = new mongoose_1.default.Schema({
    replyId: Number,
    reply: String,
    createdAt: { type: Date, default: Date.now },
    commentId: Number
});
const CommentSchema = new mongoose_1.default.Schema({
    id: Number,
    projectId: Number,
    message: String,
    createdAt: { type: Date, default: Date.now },
    timeStamp: String,
    replies: [ReplySchema]
});
const ProjectSchema = new mongoose_1.default.Schema({
    projectId: {
        type: Number,
        required: true,
        unique: true
    },
    projectName: {
        type: String,
        required: true
    },
    projectDescription: String,
    video: String,
    comments: {
        type: [CommentSchema],
        default: []
    }
});
exports.Project = mongoose_1.default.model("Project", ProjectSchema);
