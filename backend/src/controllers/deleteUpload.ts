import { Request, Response } from "express"
import { getMediaStorage } from "../media"
import { asUploadedMediaRef, sendUploadError } from "../media/respond"
import { UploadError } from "../media/types"

/**
 * @swagger
 * /uploads:
 *   delete:
 *     summary: Abort an upload and remove what was uploaded so far
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
 *               - key
 *               - uploadId
 *             properties:
 *               key:
 *                 type: string
 *               uploadId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Upload aborted, also returned when nothing existed
 *       400:
 *         description: Invalid upload key
 */
export const deleteUpload = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = req.user?._id?.toString()
    const ref = asUploadedMediaRef(req.body)
    if (!userId || !ref) throw new UploadError(400, "Invalid upload key")

    await getMediaStorage().abortUpload({ userId, ref })

    return res.status(200).json({
      success: true,
      response: null,
      message: "Upload aborted",
    })
  } catch (error) {
    return sendUploadError(res, error)
  }
}
