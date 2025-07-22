"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.directUpload = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const cloudinary_1 = require("cloudinary");
// Cloudinary config
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
console.log("Cloudinary ENV check:", {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const directUpload = async (req, res) => {
    try {
        const filePath = req.body.filePath; // e.g., "uploads/myfile.mp4"
        if (!filePath) {
            return res.status(400).json({ success: false, message: "Missing filePath in body" });
        }
        const result = await cloudinary_1.v2.uploader.upload(filePath, {
            resource_type: "video",
            folder: "videos",
            public_id: "manual_upload",
            overwrite: true,
        });
        res.json({ success: true, cloudinary: result });
    }
    catch (err) {
        console.error("Upload error:", err);
        res.status(500).json({ success: false, message: err.message || "Upload failed" });
    }
};
exports.directUpload = directUpload;
