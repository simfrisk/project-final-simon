import { Request, Response } from "express";
import { Project } from "../models/Projects";

/**
 * @swagger
 * /classes/{classId}/projects:
 *   get:
 *     summary: Get projects for a class
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
 *         description: The class ID
 *     responses:
 *       200:
 *         description: A list of projects
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
 *                       projectName:
 *                         type: string
 *                       projectDescription:
 *                         type: string
 *                         nullable: true
 *                       video:
 *                         type: string
 *                         nullable: true
 *                       thumbnail:
 *                         type: string
 *                         nullable: true
 *                       classId:
 *                         type: string
 *                       projectCreatedBy:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *                           profileImage:
 *                             type: string
 *                             nullable: true
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error
 */
export const getProjects = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { classId } = req.params;

    const result = await Project.find({ classId })
      .select("projectName projectDescription video thumbnail classId projectCreatedBy")
      .populate("projectCreatedBy", "name email profileImage")

    return res.status(200).json({
      success: true,
      response: result,
      message: "Projects fetched successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      response: null,
      message: "Failed to fetch projects."
    });
  }
};