"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetDatabase = void 0;
const Projects_1 = require("../models/Projects");
const Comment_1 = require("../models/Comment");
const Reply_1 = require("../models/Reply");
const data_json_1 = __importDefault(require("../data.json"));
const resetDatabase = async () => {
    if (!process.env.RESET_DB)
        return;
    console.log("🌱 Resetting and seeding database...");
    try {
        await Reply_1.Reply.deleteMany({});
        await Comment_1.CommentModel.deleteMany({});
        await Projects_1.Project.deleteMany({});
        // Step 1: Insert Projects and keep saved documents
        const savedProjects = [];
        for (const project of data_json_1.default.projects) {
            const savedProject = await new Projects_1.Project(project).save();
            savedProjects.push(savedProject);
        }
        console.log(`Saved ${savedProjects.length} projects.`);
        // Step 2: Insert Comments with correct projectId and keep saved comments
        const savedComments = [];
        for (const comment of data_json_1.default.comments) {
            if (comment.projectIndex === undefined ||
                comment.projectIndex < 0 ||
                comment.projectIndex >= savedProjects.length) {
                console.error(`Invalid projectIndex ${comment.projectIndex} for comment:`, comment);
                continue; // skip saving this comment
            }
            const projectId = savedProjects[comment.projectIndex]._id;
            if (!projectId) {
                console.error(`Missing projectId for comment at projectIndex ${comment.projectIndex}:`, comment);
                continue; // skip saving
            }
            const commentToSave = {
                content: comment.content,
                createdAt: new Date(comment.createdAt),
                timeStamp: comment.timeStamp,
                projectId,
                replies: [],
            };
            try {
                const savedComment = await new Comment_1.CommentModel(commentToSave).save();
                savedComments.push(savedComment);
            }
            catch (error) {
                console.error("Failed to save comment:", commentToSave, error);
            }
        }
        console.log(`Saved ${savedComments.length} comments.`);
        // Step 3: Insert Replies with correct commentId
        for (const reply of data_json_1.default.replies) {
            if (reply.commentIndex === undefined ||
                reply.commentIndex < 0 ||
                reply.commentIndex >= savedComments.length) {
                console.error(`Invalid commentIndex ${reply.commentIndex} for reply:`, reply);
                continue; // skip saving this reply
            }
            const commentId = savedComments[reply.commentIndex]._id;
            if (!commentId) {
                console.error(`Missing commentId for reply at commentIndex ${reply.commentIndex}:`, reply);
                continue;
            }
            const replyToSave = {
                content: reply.content,
                createdAt: new Date(reply.createdAt),
                commentId,
            };
            try {
                const savedReply = await new Reply_1.Reply(replyToSave).save();
                // Add reply ID to the parent comment's replies array
                const parentComment = savedComments[reply.commentIndex];
                parentComment.replies.push(savedReply._id);
                await parentComment.save();
            }
            catch (error) {
                console.error("Failed to save reply:", replyToSave, error);
            }
        }
        console.log("✅ Seeding complete.");
    }
    catch (error) {
        console.error("❌ Error during database reset:", error);
    }
};
exports.resetDatabase = resetDatabase;
