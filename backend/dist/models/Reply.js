"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Reply = void 0;
const mongoose_1 = require("mongoose");
const ReplySchema = new mongoose_1.Schema({
    content: { type: String, required: true },
    commentId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Comment", required: true },
    createdAt: { type: Date, default: Date.now },
});
exports.Reply = (0, mongoose_1.model)("Reply", ReplySchema);
