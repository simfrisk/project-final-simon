import dotenv from "dotenv"
dotenv.config()

import multer from "multer"
import { v2 as cloudinary } from "cloudinary"
import { CloudinaryStorage } from "multer-storage-cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
})

const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "profile_pictures",
    resource_type: "image",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  } as any,
})

export const uploadImage = multer({ storage: imageStorage })
