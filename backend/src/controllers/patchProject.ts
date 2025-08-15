import { Request, Response } from "express";
import { Project } from "../models/Projects";

/**
 * @swagger
 * /projects/{projectId}:
 *   patch:
 *     summary: Update an existing project's name and/or description
 *     description: Allows an authenticated user to update the name and/or description of a project by its ID.
 *     tags:
 *       - Projects
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the project to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newName:
 *                 type: string
 *                 example: Updated Project Title
 *               newDescription:
 *                 type: string
 *                 example: This is an updated description for the project.
 *     responses:
 *       200:
 *         description: The project was successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 response:
 *                   $ref: '#/components/schemas/Project'
 *                 message:
 *                   type: string
 *                   example: The project was successfully updated
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
 *                   type: null
 *                   example: null
 *                 message:
 *                   type: string
 *                   example: The project was not found
 *       500:
 *         description: Server error when updating the project
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
 *                   example: Could not change project in the database
 *                 message:
 *                   type: string
 *                   example: Could not change project in the database
 */
export const patchProject = async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const { newName, newDescription } = req.body;

  try {
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        response: null,
        message: "The project was not found"
      });
    }

    if (newName) project.projectName = newName;
    if (newDescription) project.projectDescription = newDescription;

    const updatedProject = await project.save();

    res.status(200).json({
      success: true,
      response: updatedProject,
      message: "The project was successfully updated"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      response: error instanceof Error ? error.message : "Unknown error",
      message: "Could not change project in the database"
    });
  }
};