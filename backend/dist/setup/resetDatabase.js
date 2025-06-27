"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetDatabase = void 0;
const Projects_1 = require("../models/Projects");
const comment_1 = require("../models/comment");
const Reply_1 = require("../models/Reply");
const data_json_1 = __importDefault(require("../data.json"));
const resetDatabase = () => {
    if (process.env.RESET_DB) {
        const seedDatabase = async () => {
            console.log("🌱 Resetting and seeding database...");
            await Reply_1.Reply.deleteMany({});
            await comment_1.Comment.deleteMany({});
            await Projects_1.Project.deleteMany({});
            // Step 1: Insert Projects
            for (const project of data_json_1.default.projects) {
                await new Projects_1.Project(project).save();
            }
            // Step 2: Insert Comments
            for (const comment of data_json_1.default.comments) {
                await new comment_1.Comment(comment).save();
            }
            // Step 3: Insert Replies
            for (const reply of data_json_1.default.replies) {
                await new Reply_1.Reply(reply).save();
            }
            console.log("✅ Seeding complete.");
        };
        seedDatabase().catch((err) => {
            console.error("❌ Seeding error:", err);
        });
    }
};
exports.resetDatabase = resetDatabase;
