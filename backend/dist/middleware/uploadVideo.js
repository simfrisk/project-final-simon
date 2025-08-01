"use strict";
// middleware/uploadVideo.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadVideo = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config(); // ✅ this MUST be before Cloudinary config
const multer_1 = __importDefault(require("multer"));
const cloudinary_1 = require("cloudinary");
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
// Optional: debug log
console.log("Cloudinary ENV check:", {
    name: process.env.CLOUDINARY_CLOUD_NAME,
    keySet: !!process.env.CLOUDINARY_API_KEY,
    secretSet: !!process.env.CLOUDINARY_API_SECRET,
});
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const storage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_1.v2,
    params: {
        folder: "videos",
        resource_type: "video",
        allowed_formats: ["mp4", "mov", "avi"],
    },
});
exports.uploadVideo = (0, multer_1.default)({ storage });
