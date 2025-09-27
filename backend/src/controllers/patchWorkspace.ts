import { Request, Response } from "express"
import { WorkspaceModel } from "../models/workspace"

/**
 * @swagger
 * /workspace/{workspaceId}:
 *   patch:
 *     summary: Update an existing workspace's name
 *     tags:
 *       - Workspaces
 *     description: Allows an authenticated user to update the name of a workspace by its ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the workspace to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newName:
 *                 type: string
 *                 example: Updated Workspace Name
 *     responses:
 *       200:
 *         description: The workspace was successfully updated
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
 *                 message:
 *                   type: string
 *                   example: The workspace was successfully updated
 *       404:
 *         description: Workspace not found
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
 *                   example: The workspace was not found
 *       500:
 *         description: Server error when updating the workspace
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
 *                   example: Could not change workspace in the database
 *                 message:
 *                   type: string
 *                   example: Could not change workspace in the database
 */
export const patchWorkspace = async (req: Request, res: Response) => {
  const { workspaceId } = req.params
  const { newName } = req.body

  try {
    const workspaceDoc = await WorkspaceModel.findById(workspaceId)

    if (!workspaceDoc) {
      return res.status(404).json({
        success: false,
        response: null,
        message: "The workspace was not found",
      })
    }

    if (newName) workspaceDoc.name = newName

    const updatedWorkspace = await workspaceDoc.save()

    res.status(200).json({
      success: true,
      response: updatedWorkspace,
      message: "The workspace was successfully updated",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      response: error instanceof Error ? error.message : "Unknown error",
      message: "Could not change workspace in the database",
    })
  }
}
