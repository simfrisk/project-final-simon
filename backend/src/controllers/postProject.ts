import { Request, Response } from "express"
import { Project } from "../models/Projects"
import { getMediaStorage } from "../media"
import { asUploadedMediaRef, sendUploadError } from "../media/respond"
import { StoredMedia, UploadError } from "../media/types"

/**
 * @swagger
 * /classes/{classId}/projects:
 *   post:
 *     summary: Create a new project within a class
 *     tags:
 *       - Projects
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the class to add the project to
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - projectName
 *             properties:
 *               projectName:
 *                 type: string
 *                 example: "My Awesome Project"
 *               projectDescription:
 *                 type: string
 *                 example: "A detailed description of the project."
 *               teacher:
 *                 type: string
 *                 example: "Mr. Smith"
 *               video:
 *                 type: object
 *                 description: Reference to a finished direct upload, see POST /uploads
 *                 required:
 *                   - key
 *                   - uploadId
 *                 properties:
 *                   key:
 *                     type: string
 *                   uploadId:
 *                     type: string
 *     responses:
 *       201:
 *         description: Project created successfully
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
 *                     _id:
 *                       type: string
 *                     classId:
 *                       type: string
 *                     projectName:
 *                       type: string
 *                     projectDescription:
 *                       type: string
 *                     teacher:
 *                       type: string
 *                     video:
 *                       type: string
 *                     thumbnail:
 *                       type: string
 *                     projectCreatedBy:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                         profileImage:
 *                           type: string
 *                           nullable: true
 *                 message:
 *                   type: string
 *                   example: "Project created"
 *       400:
 *         description: Bad request, missing projectName, invalid upload key or unsupported file type
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 response:
 *                   nullable: true
 *                 message:
 *                   type: string
 *                   example: "Project name is required"
 *       404:
 *         description: Uploaded video not found
 *       413:
 *         description: File too large, the response holds maxBytes
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 response:
 *                   nullable: true
 *                 message:
 *                   type: string
 *                   example: "Unknown server error"
 */
export const postProject = async (
  req: Request,
  res: Response
): Promise<Response> => {
  let stored: StoredMedia | null = null
  let uploadId = ""
  const userId = req.user?._id?.toString()

  try {
    const { classId } = req.params
    const { projectName, projectDescription, teacher, video } = req.body ?? {}

    if (!projectName) {
      return res.status(400).json({
        success: false,
        response: null,
        message: "Project name is required",
      })
    }

    // The file itself was uploaded straight to the storage provider. Here it is only verified and recorded.
    if (video !== undefined && video !== null) {
      const ref = asUploadedMediaRef(video)
      if (!ref || !userId) throw new UploadError(400, "Invalid upload key")
      stored = await getMediaStorage().completeUpload({ userId, purpose: "video", ref })
      uploadId = ref.uploadId
    }

    const newProject = new Project({
      classId,
      projectName,
      projectDescription,
      teacher,
      video: stored?.url || "",
      thumbnail: stored?.thumbnailUrl || "",
      projectCreatedBy: req.user?._id,
    })

    const savedNewProject = await newProject.save()

    // Populate the 'projectCreatedBy' field
    await savedNewProject.populate(
      "projectCreatedBy",
      "_id name email profileImage"
    )

    return res.status(201).json({
      success: true,
      response: savedNewProject,
      message: "Project created",
    })
  } catch (error) {
    // A verified upload that never became a project would stay behind in storage.
    if (stored && userId) {
      getMediaStorage()
        .abortUpload({ userId, ref: { key: stored.key, uploadId } })
        .catch(() => undefined)
    }

    if (error instanceof UploadError) return sendUploadError(res, error)

    console.error("Error in postProject:", error)

    if (error instanceof Error) {
      return res.status(500).json({
        success: false,
        response: null,
        message: error.message,
      })
    }

    return res.status(500).json({
      success: false,
      response: null,
      message: "Unknown server error",
    })
  }
}
