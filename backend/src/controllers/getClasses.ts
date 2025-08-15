import { Request, Response } from "express";
import { ClassModel } from "../models/Class";

/**
 * @swagger
 * /classes:
 *   get:
 *     summary: Retrieve all classes
 *     description: Retrieve a list of classes with their titles.
 *     tags:
 *       - Classes
 *     responses:
 *       200:
 *         description: A list of classes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 response:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       classTitle:
 *                         type: string
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error fetching classes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 response:
 *                   type: null
 *                 message:
 *                   type: string
 */
export const getClasses = async (req: Request, res: Response): Promise<Response> => {
  try {
    const result = await ClassModel.find().select("classTitle");

    return res.status(200).json({
      success: true,
      response: result,
      message: "Classes fetched successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      response: null,
      message: "Failed to fetch classes."
    });
  }
};