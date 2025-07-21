import { Request, Response } from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

// Cloudinary config (assumes dotenv.config() called in server.ts)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// Set up Cloudinary storage for videos
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "videos",
    resource_type: "video",
    allowed_formats: ["mp4", "mov", "avi"],
  } as any,
});

const upload = multer({ storage });

// Wrap multer middleware to use in an async function
const uploadMiddleware = (req: Request, res: Response): Promise<void> =>
  new Promise((resolve, reject) => {
    upload.single("video")(req, res, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });

export const postUploadVideo = async (req: Request, res: Response): Promise<Response> => {
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
        url: (req.file as any).path,
        public_id: (req.file as any).filename,
      },
      message: "Video uploaded successfully",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      response: error,
      message: "Video upload failed",
    });
  }
};