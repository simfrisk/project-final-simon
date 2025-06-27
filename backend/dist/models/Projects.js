"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Project = void 0;
const mongoose_1 = require("mongoose");
const ProjectSchema = new mongoose_1.Schema({
    projectName: { type: String, required: true },
    projectDescription: String,
    video: String,
    comments: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Comment" }],
});
exports.Project = (0, mongoose_1.model)("Project", ProjectSchema);
