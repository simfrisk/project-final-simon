import { Request, Response } from "express";
import { Project } from "../models/Projects";

/**
 * @swagger
 * /classes/{classId}/projects:
 *   get:
 *     summary: Get all projects for a specific class
 *     description: Retrieve a list of projects that belong to a specific class by providing its ID.
 *     tags:
 *       - Projects
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the class
 *     responses:
 *       200:
 *         description: Projects fetched successfully
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
 *                         example: "64c1f2a3b9f1e1234567890a"
 *                       projectName:
 *                         type: string
 *                         example: "My Cool Project"
 *                       projectDescription:
 *                         type: string
 *                         example: "A project that does cool things"
 *                       video:
 *                         type: string
 *                         example: "https://someurl.com/video.mp4"
 *                       thumbnail:
 *                         type: string
 *                         example: "https://someurl.com/thumbnail.jpg"
 *                       classId:
 *                         type: string
 *                         example: "64c1f2a3b9f1e1234567890b"
 *                 message:
 *                   type: string
 *                   example: "Projects fetched successfully"
 *       500:
 *         description: Failed to fetch projects
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
 *                   example: "Failed to fetch projects."
 */
export const getProjects = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { classId } = req.params;

    const result = await Project.find({ classId })
      .select("projectName projectDescription video thumbnail classId");

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