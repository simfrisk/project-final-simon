import { Project } from "../models/Projects";
import { Request, Response } from "express";

/**
 * @swagger
 * /projects/{projectId}:
 *   get:
 *     summary: Get a project by ID
 *     tags:
 *       - Projects
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the project
 *     responses:
 *       200:
 *         description: Project found successfully
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
 *                       example: "64c1f2a3b9f1e1234567890a"
 *                     projectName:
 *                       type: string
 *                       example: "My Cool Project"
 *                     projectDescription:
 *                       type: string
 *                       example: "A project that does cool things"
 *                     video:
 *                       type: string
 *                       example: "https://someurl.com/video.mp4"
 *                     classId:
 *                       type: string
 *                       example: "64c1f2a3b9f1e1234567890b"
 *                 message:
 *                   type: string
 *                   example: "Project found"
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
 *                   type: object
 *                   nullable: true
 *                   example: null
 *                 message:
 *                   type: string
 *                   example: "Project was not found"
 *       500:
 *         description: Server error fetching project
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 response:
 *                   type: string
 *                   example: "Error message or stack trace"
 *                 message:
 *                   type: string
 *                   example: "Project could not be found"
 */
export const getProjectById = async (req: Request, res: Response): Promise<Response> => {

  const { projectId } = req.params

  try {
    const project = await Project.findById(projectId).select("projectName projectDescription video");
    if (!project) {
      return res.status(404).json({
        success: false,
        response: null,
        message: "Project was not found",
      })
    }
    const { _id, projectName, projectDescription, video, classId } = project;

    return res.status(200).json({
      success: true,
      response: { _id, projectName, projectDescription, video, classId },
      message: "Project found",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      response: error,
      message: "Project could not be found"
    })
  }

}