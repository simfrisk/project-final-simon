import { Request, Response } from "express";
import { ClassModel } from "../models/Class";

/**
 * @swagger
 * /classes:
 *   post:
 *     summary: Create a new class
 *     tags:
 *       - Classes
 *     security:                   
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - classTitle
 *             properties:
 *               classTitle:
 *                 type: string
 *                 example: "Math 101"
 *     responses:
 *       201:
 *         description: Class created successfully
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
 *                     classTitle:
 *                       type: string
 *                 message:
 *                   type: string
 *                   example: "Class created successfully"
 *       400:
 *         description: Bad Request - missing classTitle
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
 *                   example: "Class title is required"
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
export const postClass = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { classTitle } = req.body;

    if (!classTitle) {
      return res.status(400).json({
        success: false,
        response: null,
        message: "Class title is required",
      });
    }

    const newClass = new ClassModel({ classTitle });
    const savedNewClass = await newClass.save();

    return res.status(201).json({
      success: true,
      response: savedNewClass,
      message: "Class created successfully",
    });
  } catch (error) {
    console.error("Error in postClass:", error);

    if (error instanceof Error) {
      return res.status(500).json({
        success: false,
        response: null,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      response: null,
      message: "Unknown server error",
    });
  }
};