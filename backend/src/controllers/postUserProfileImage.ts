import { Request, Response } from "express"
import { UserModel } from "../models/user"
import { getMediaStorage } from "../media"
import { asUploadedMediaRef, sendUploadError } from "../media/respond"
import { UploadedMediaRef, UploadError } from "../media/types"

/**
 * @swagger
 * /users/{userId}/profile-image:
 *   post:
 *     summary: Set the profile image of the signed in user from a finished upload
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
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
 *         description: Profile image updated
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
 *                     profileImage:
 *                       type: string
 *                 message:
 *                   type: string
 *                   example: "Profile image updated"
 *       400:
 *         description: Invalid upload key or unsupported file type
 *       403:
 *         description: Only the user themselves can change the profile image
 *       404:
 *         description: Uploaded image not found
 *       413:
 *         description: File too large
 */
export const postUserProfileImage = async (req: Request, res: Response): Promise<Response> => {
  const { userId } = req.params
  const callerId = req.user?._id?.toString()

  if (!callerId || callerId !== userId) {
    return res.status(403).json({
      success: false,
      response: null,
      message: "You can only change your own profile image",
    })
  }

  let storedRef: UploadedMediaRef | null = null
  try {
    const ref = asUploadedMediaRef(req.body)
    if (!ref) throw new UploadError(400, "Invalid upload key")

    const storage = getMediaStorage()
    const stored = await storage.completeUpload({ userId: callerId, purpose: "image", ref })
    storedRef = ref

    const updated = await UserModel.findByIdAndUpdate(callerId, { $set: { profileImage: stored.url } }, { new: true })
    if (!updated) throw new UploadError(404, "User not found")

    return res.status(200).json({
      success: true,
      response: { profileImage: updated.profileImage },
      message: "Profile image updated",
    })
  } catch (error) {
    // The image was accepted by the storage but the user could not be updated: do not leave it orphaned.
    if (storedRef) {
      getMediaStorage()
        .abortUpload({ userId: callerId, ref: storedRef })
        .catch(() => undefined)
    }
    return sendUploadError(res, error)
  }
}
