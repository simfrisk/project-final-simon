"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkspaceInvitationModel = void 0;
const mongoose_1 = require("mongoose");
const WorkspaceInvitationSchema = new mongoose_1.Schema({
    workspaceId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Workspace",
        required: true,
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    token: {
        type: String,
        required: true,
        unique: true,
    },
    expiresAt: {
        type: Date,
        required: true,
        default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
    isUsed: {
        type: Boolean,
        default: false,
    },
    usedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
    },
    usedAt: {
        type: Date,
    },
    allowedRole: {
        type: String,
        enum: ["student", "teacher"],
        default: "student",
    },
    schemaVersion: { type: String, default: "v2" },
});
// Index for performance
WorkspaceInvitationSchema.index({ token: 1 });
WorkspaceInvitationSchema.index({ expiresAt: 1 });
exports.WorkspaceInvitationModel = (0, mongoose_1.model)("WorkspaceInvitation", WorkspaceInvitationSchema);
