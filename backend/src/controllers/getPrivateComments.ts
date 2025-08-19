import { Request, Response } from "express"
import { CommentModel } from "../models/Comment"

/**
 * @swagger
 * /projects/{projectId}/comments/private:
 *   get:
 *     summary: Get private comments for a project by the authenticated user
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
 *         description: The ID of the project to get private comments for
 *     responses:
 *       200:
 *         description: Private comments fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 response:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       commentText:
 *                         type: string
 *                       commentType:
 *                         type: string
 *                         example: "private"
 *                       commentCreatedBy:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           profileImage:
 *                             type: string
 *                           role:
 *                             type: string
 *                       replies:
 *                         type: array
 *                         items:
 *                           type: object
 *                 message:
 *                   type: string
 *                   example: "Private comments by user fetched successfully"
 *       401:
 *         description: Unauthorized, user ID not found
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
 *                   example: null
 *                 message:
 *                   type: string
 *                   example: "Unauthorized: User ID not found"
 *       500:
 *         description: Failed to fetch private comments
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
 *                   example: null
 *                 message:
 *                   type: string
 *                   example: "Failed to fetch private comments"
 */
export const getPrivateComments = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { projectId } = req.params
  const userId = req.user?._id // or however your user ID is stored

  if (!userId) {
    return res.status(401).json({
      success: false,
      response: null,
      message: "Unauthorized: User ID not found",
    })
  }

  try {
    const comments = await CommentModel.find({
      projectId,
      commentType: "private",
      commentCreatedBy: userId,
    })
      .populate("replies")
      .populate("commentCreatedBy", "name profileImage role")

    return res.status(200).json({
      success: true,
      response: comments,
      message: "Private comments by user fetched successfully",
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      response: null,
      message: "Failed to fetch private comments",
    })
  }
}
