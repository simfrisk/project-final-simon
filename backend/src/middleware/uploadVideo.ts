// middleware/uploadVideo.ts

import dotenv from "dotenv"
dotenv.config() // ✅ this MUST be before Cloudinary config

import multer from "multer"
import { v2 as cloudinary } from "cloudinary"
import { CloudinaryStorage } from "multer-storage-cloudinary"

// Optional: debug log
console.log("Cloudinary ENV check:", {
  name: process.env.CLOUDINARY_CLOUD_NAME,
  keySet: !!process.env.CLOUDINARY_API_KEY,
  secretSet: !!process.env.CLOUDINARY_API_SECRET,
})

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
})

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "videos",
    resource_type: "video",
    allowed_formats: ["mp4", "mov", "avi"],
  } as any,
})

export const uploadVideo = multer({ storage })
