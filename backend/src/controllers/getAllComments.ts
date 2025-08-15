import { Request, Response } from "express";
import { CommentModel } from "../models/Comment";

/**
 * @swagger
 * /comments/all:
 *   get:
 *     summary: Get all comments
 *     description: Fetches all comments from the database.
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
 *                     $ref: '#/components/schemas/Comment'
 *                 message:
 *                   type: string
 *                   example: All comments fetched successfully
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
 *                   type: null
 *                   example: null
 *                 message:
 *                   type: string
 *                   example: Failed to fetch comments
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