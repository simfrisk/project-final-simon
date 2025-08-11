import { Request, Response } from "express";
import { CommentModel } from "../models/Comment";

/**
 * @swagger
 * /projects/{projectId}/comments:
 *   get:
 *     summary: Get comments (type "question") for a project
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the project
 *     responses:
 *       200:
 *         description: Comments fetched successfully
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
 *                         example: "64c1f2a3b9f1e1234567890c"
 *                       commentText:
 *                         type: string
 *                         example: "This is a comment?"
 *                       commentType:
 *                         type: string
 *                         example: "question"
 *                       commentCreatedBy:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: "Alice"
 *                           profileImage:
 *                             type: string
 *                             example: "https://someurl.com/profile.jpg"
 *                           role:
 *                             type: string
 *                             example: "student"
 *                       replies:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             _id:
 *                               type: string
 *                               example: "64c1f2a3b9f1e1234567890d"
 *                             replyText:
 *                               type: string
 *                               example: "This is a reply."
 *                             replyCreatedBy:
 *                               type: object
 *                               properties:
 *                                 name:
 *                                   type: string
 *                                   example: "Bob"
 *                                 profileImage:
 *                                   type: string
 *                                   example: "https://someurl.com/profile2.jpg"
 *                                 role:
 *                                   type: string
 *                                   example: "instructor"
 *                 message:
 *                   type: string
 *                   example: "Comments fetched successfully"
 *       500:
 *         description: Failed to fetch comments
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
 *                   example: "Failed to fetch comments"
 */
export const getComments = async (req: Request, res: Response): Promise<Response> => {
  const { projectId } = req.params;

  try {
    const comments = await CommentModel.find({ projectId, commentType: "question" })

      .populate({
        path: "replies",
        populate: {
          path: "replyCreatedBy",
          select: "name profileImage role"
        }
      })
      .populate("commentCreatedBy", "name profileImage role");
    return res.status(200).json({
      success: true,
      response: comments,
      message: "Comments fetched successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      response: null,
      message: "Failed to fetch comments",
    });
  }
};