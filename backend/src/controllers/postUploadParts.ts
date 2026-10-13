import { Request, Response } from "express"
import { getMediaStorage } from "../media"
import { asUploadedMediaRef, sendUploadError } from "../media/respond"
import { SignPartsResponse, UploadError } from "../media/types"

/**
 * @swagger
 * /uploads/parts:
 *   post:
 *     summary: Sign upload part URLs for an S3 multipart upload
 *     description: The browser PUTs each part to its URL with no request headers at all. Part numbers go 1 to 50 per call. Only the s3 provider uses this.
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
 *               - partNumbers
 *             properties:
 *               key:
 *                 type: string
 *               uploadId:
 *                 type: string
 *               partNumbers:
 *                 type: array
 *                 minItems: 1
 *                 maxItems: 50
 *                 items:
 *                   type: integer
 *                   minimum: 1
 *     responses:
 *       200:
 *         description: Presigned part URLs, valid for 15 minutes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 response:
 *                   type: object
 *                   properties:
 *                     parts:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           partNumber:
 *                             type: integer
 *                           url:
 *                             type: string
 *                 message:
 *                   type: string
 *                   example: "Part URLs signed"
 *       400:
 *         description: Invalid upload key, invalid part numbers, or the provider does not use parts
 *       404:
 *         description: Upload not found, for example after 24 hours
 */
export const postUploadParts = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = req.user?._id?.toString()
    const ref = asUploadedMediaRef(req.body)
    if (!userId || !ref) throw new UploadError(400, "Invalid upload key")

    const { partNumbers } = req.body ?? {}
    if (!Array.isArray(partNumbers)) throw new UploadError(400, "Invalid part numbers")

    const parts = await getMediaStorage().signParts({ userId, key: ref.key, uploadId: ref.uploadId, partNumbers })
    const response: SignPartsResponse = { parts }

    return res.status(200).json({ success: true, response, message: "Part URLs signed" })
  } catch (error) {
    return sendUploadError(res, error)
  }
}
