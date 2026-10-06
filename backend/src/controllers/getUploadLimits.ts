import { Request, Response } from "express"
import { getMediaStorage } from "../media"
import { sendUploadError } from "../media/respond"

/**
 * @swagger
 * /uploads/limits:
 *   get:
 *     summary: Get the upload limits and the active storage provider
 *     tags:
 *       - Uploads
 *     security: []
 *     responses:
 *       200:
 *         description: Upload limits
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
 *                     provider:
 *                       type: string
 *                       enum: [cloudinary, s3]
 *                     videoMaxBytes:
 *                       type: number
 *                     imageMaxBytes:
 *                       type: number
 *                     videoFormats:
 *                       type: array
 *                       items:
 *                         type: string
 *                     imageFormats:
 *                       type: array
 *                       items:
 *                         type: string
 *                 message:
 *                   type: string
 *                   example: "Upload limits"
 */
export const getUploadLimits = (_req: Request, res: Response): Response => {
  try {
    return res.status(200).json({
      success: true,
      response: getMediaStorage().limits(),
      message: "Upload limits",
    })
  } catch (error) {
    return sendUploadError(res, error)
  }
}
