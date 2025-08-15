import { Request, Response } from "express";
import { CommentModel } from "../models/Comment";

/**
 * @swagger
 * /comments/all:
 *   get:
 *     summary: Get all comments
 *     tags:
 *       - Comments
 *     security:                   
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All comments fetched successfully
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
 *                         example: "This is a comment."
 *                       commentType:
 *                         type: string
 *                         example: "question"
 *                       projectId:
 *                         type: string
 *                         example: "64c1f2a3b9f1e1234567890b"
 *                       commentCreatedBy:
 *                         type: string
 *                         example: "64c1f2a3b9f1e1234567890f"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-08-10T14:48:00.000Z"
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-08-10T14:48:00.000Z"
 *                 message:
 *                   type: string
 *                   example: "All comments fetched successfully"
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
export const getAllComments = async (req: Request, res: Response): Promise<Response> => {
  try {
    const comments = await CommentModel.find();

    return res.status(200).json({
      success: true,
      response: comments,
      message: "All comments fetched successfully",
    });
  } catch (error) {
    console.error("❌ Error fetching all comments:", error);
    return res.status(500).json({
      success: false,
      response: null,
      message: "Failed to fetch comments",
    });
  }
};