import { Request, Response } from "express"
import { Types } from "mongoose"
import { Project } from "../models/Projects"
import { CommentModel } from "../models/Comment"

/**
 * @swagger
 * /projects/{projectId}/comments:
 *   post:
 *     summary: Add a new comment to a project
 *     tags:
 *       - Comments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the project to add a comment to
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *               - timeStamp
 *               - commentType
 *             properties:
 *               content:
 *                 type: string
 *                 example: "This is a comment on the project."
 *               timeStamp:
 *                 type: number
 *                 description: Time in seconds or milliseconds referring to the video timestamp
 *                 example: 45
 *               commentType:
 *                 type: string
 *                 description: Type of comment (e.g., question, private)
 *                 example: "question"
 *     responses:
 *       201:
 *         description: Comment added successfully
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
 *                     content:
 *                       type: string
 *                     projectId:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     timeStamp:
 *                       type: number
 *                     isChecked:
 *                       type: boolean
 *                     commentCreatedBy:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         profileImage:
 *                           type: string
 *                         role:
 *                           type: string
 *                     commentType:
 *                       type: string
 *                     replies:
 *                       type: array
 *                       items:
 *                         type: string
 *                     likes:
 *                       type: array
 *                       items:
 *                         type: string
 *                 message:
 *                   type: string
 *                   example: "Comment added to project"
 *       400:
 *         description: Missing required fields
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
 *                   example: "Comment text, timestamp, and comment type are required"
 *       404:
 *         description: Project not found
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
 *                   example: "Project not found"
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
 *                   example: "Could not add comment"
 */
export const postCommentById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { projectId } = req.params
  const { content, timeStamp, commentType } = req.body

  // Validate required fields
  if (!content || !timeStamp || !commentType) {
    return res.status(400).json({
      success: false,
      response: null,
      message: "Comment text, timestamp, and comment type are required",
    })
  }

  try {
    // Find the project
    const project = await Project.findById(projectId)

    if (!project) {
      return res.status(404).json({
        success: false,
        response: null,
        message: "Project not found",
      })
    }

    // Create a new comment
    const newComment = new CommentModel({
      content,
      projectId: project._id,
      createdAt: new Date(),
      timeStamp,
      isChecked: false,
      commentCreatedBy: req.user?._id,
      commentType,
      replies: [],
      likes: [],
    })

    // Save the comment
    await newComment.save()

    // Populate the commentCreatedBy field before returning
    await newComment.populate("commentCreatedBy", "name profileImage role")

    // Add comment to the project
    project.comments.push(newComment._id as Types.ObjectId)
    await project.save()

    // Respond with success and populated comment
    return res.status(201).json({
      success: true,
      response: newComment,
      message: "Comment added to project",
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      response: error,
      message: "Could not add comment",
    })
  }
}
