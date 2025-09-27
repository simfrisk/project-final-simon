"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamModel = void 0;
const mongoose_1 = require("mongoose");
const TeamSchema = new mongoose_1.Schema({
    teamName: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 100,
        trim: true,
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    assignedTeachers: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User", default: [] }],
    workspaceId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Workspace", required: true },
    accessTo: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Class", default: [] }],
    schemaVersion: { type: String, default: "v2" },
});
exports.TeamModel = (0, mongoose_1.model)("Team", TeamSchema);
