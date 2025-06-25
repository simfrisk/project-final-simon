"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Project = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const ReplySchema = new mongoose_1.default.Schema({
    reply: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});
const CommentSchema = new mongoose_1.default.Schema({
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    timeStamp: { type: String },
    replies: [ReplySchema],
});
const ProjectSchema = new mongoose_1.default.Schema({
    projectName: { type: String, required: true },
    projectDescription: String,
    video: String,
    comments: { type: [CommentSchema], default: [] },
});
exports.Project = mongoose_1.default.model("Project", ProjectSchema);
