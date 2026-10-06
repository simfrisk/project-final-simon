import { Request, Response } from "express"
import { getMediaStorage } from "../media"
import { sendUploadError } from "../media/respond"
import { UploadError } from "../media/types"

/**
 * @swagger
 * /uploads:
 *   post:
 *     summary: Create a signed upload ticket for a direct browser upload
 *     description: The browser uploads the bytes straight to the storage provider using the returned ticket. This API never receives the file.
 *     tags:
 *       - Uploads
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - purpose
 *               - fileName
 *               - contentType
 *               - sizeBytes
 *             properties:
 *               purpose:
 *                 type: string
 *                 enum: [video, image]
 *               fileName:
 *                 type: string
 *                 example: "lecture.mp4"
 *               contentType:
 *                 type: string
 *                 example: "video/mp4"
 *               sizeBytes:
 *                 type: number
 *                 example: 5242880
 *               resumeKey:
 *                 type: string
 *                 description: Key of an upload in progress, to get a freshly signed ticket for it
 *     responses:
 *       200:
 *         description: Upload ticket created
 *       400:
 *         description: Invalid purpose, unsupported file type, invalid upload key or invalid sizeBytes
 *       413:
 *         description: File too large, the response holds maxBytes
 *       500:
 *         description: Server error
 */
export const postUpload = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = req.user?._id?.toString()
    if (!userId) throw new UploadError(400, "Invalid upload key")

    const { purpose, fileName, contentType, sizeBytes, resumeKey } = req.body ?? {}

    if (purpose !== "video" && purpose !== "image") throw new UploadError(400, "Invalid purpose")
    if (typeof fileName !== "string" || fileName.trim() === "" || fileName.length > 255) {
      throw new UploadError(400, "Unsupported file type")
    }
    if (resumeKey !== undefined && typeof resumeKey !== "string") throw new UploadError(400, "Invalid upload key")

    const ticket = await getMediaStorage().createUpload({
      userId,
      purpose,
      fileName,
      contentType: typeof contentType === "string" ? contentType : "",
      sizeBytes,
      resumeKey,
    })

    return res.status(200).json({
      success: true,
      response: ticket,
      message: "Upload ticket created",
    })
  } catch (error) {
    return sendUploadError(res, error)
  }
}
