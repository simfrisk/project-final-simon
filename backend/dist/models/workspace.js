"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkspaceModel = void 0;
const mongoose_1 = require("mongoose");
const WorkspaceSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 60,
        trim: true,
    },
    classes: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Class", default: [] }],
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    teams: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Team", default: [] }],
    schemaVersion: { type: String, default: "v2" },
});
exports.WorkspaceModel = (0, mongoose_1.model)("Workspace", WorkspaceSchema);
