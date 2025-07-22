import dotenv from "dotenv";
dotenv.config();
// endpoints/directUpload.ts
import { Request, Response } from "express";
import { v2 as cloudinary } from "cloudinary";


// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

console.log("Cloudinary ENV check:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const directUpload = async (req: Request, res: Response) => {
  try {
    const filePath = req.body.filePath; // e.g., "uploads/myfile.mp4"

    if (!filePath) {
      return res.status(400).json({ success: false, message: "Missing filePath in body" });
    }

    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "video",
      folder: "videos",
      public_id: "manual_upload",
      overwrite: true,
    });

    res.json({ success: true, cloudinary: result });
  } catch (err: any) {
    console.error("Upload error:", err);
    res.status(500).json({ success: false, message: err.message || "Upload failed" });
  }
};