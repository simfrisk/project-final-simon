"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassModel = void 0;
const mongoose_1 = require("mongoose");
const ClassSchema = new mongoose_1.Schema({
    classTitle: { type: String, required: true, maxlength: 100, trim: true },
    projects: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Project" }],
});
exports.ClassModel = (0, mongoose_1.model)("Class", ClassSchema);
