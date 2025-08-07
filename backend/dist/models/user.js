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
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    profileImage: {
        type: String,
        default: "/SImon.png"
    },
    accessToken: {
        type: String,
        default: () => crypto_1.default.randomBytes(128).toString("hex")
    },
    likedComments: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Comment", default: [] }],
    likedReplies: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Reply", default: [] }],
});
exports.UserModel = (0, mongoose_1.model)("User", UserSchema);
