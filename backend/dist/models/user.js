"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = require("mongoose");
const crypto_1 = __importDefault(require("crypto"));
const UserSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 100,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 4,
        maxlength: 100,
        trim: true,
    },
    role: {
        type: String,
        required: true,
        enum: ["teacher", "student"],
    },
    profileImage: {
        type: String,
        default: "https://res.cloudinary.com/dgr7l5nsx/image/upload/w_100,h_100,c_fill/v1754899421/profile_pictures/wtvbkvjnxrbdzfvjcmbi.png",
    },
    accessToken: {
        type: String,
        default: () => crypto_1.default.randomBytes(128).toString("hex"),
    },
    likedComments: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Comment", default: [] }],
    likedReplies: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Reply", default: [] }],
    workspaces: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Workspace", default: [] }],
    teams: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Team", default: [] }],
    assignedTeams: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Team", default: [] }],
    schemaVersion: { type: String, default: "v2" },
});
exports.UserModel = (0, mongoose_1.model)("User", UserSchema);
