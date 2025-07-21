"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postUploadVideo = void 0;
const multer_1 = __importDefault(require("multer"));
const cloudinary_1 = require("cloudinary");
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
// Cloudinary config (assumes dotenv.config() called in server.ts)
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
// Set up Cloudinary storage for videos
const storage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_1.v2,
    params: {
        folder: "videos",
        resource_type: "video",
        allowed_formats: ["mp4", "mov", "avi"],
    },
});
const upload = (0, multer_1.default)({ storage });
// Wrap multer middleware to use in an async function
const uploadMiddleware = (req, res) => new Promise((resolve, reject) => {
    upload.single("video")(req, res, (err) => {
        if (err)
            reject(err);
        else
            resolve();
    });
});
const postUploadVideo = async (req, res) => {
    try {
        // Run multer middleware to handle the file upload
        await uploadMiddleware(req, res);
        if (!req.file) {
            return res.status(400).json({
                success: false,
                response: null,
                message: "No video file uploaded",
            });
        }
        // Return success response with file info
        return res.status(201).json({
            success: true,
            response: {
                url: req.file.path,
                public_id: req.file.filename,
            },
            message: "Video uploaded successfully",
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            response: error,
            message: "Video upload failed",
        });
    }
};
exports.postUploadVideo = postUploadVideo;
