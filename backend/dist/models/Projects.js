"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Project = void 0;
const mongoose_1 = require("mongoose");
const ProjectSchema = new mongoose_1.Schema({
    classId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Class", required: true },
    projectName: { type: String, required: true, maxlength: 200, trim: true },
    projectDescription: String,
    teacher: String,
    video: String,
    thumbnail: String,
    projectCreatedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    comments: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Comment" }],
    schemaVersion: { type: String, default: "v2" },
});
exports.Project = (0, mongoose_1.model)("Project", ProjectSchema);
