import { Request, Response } from "express"
import { WorkspaceModel } from "../models/workspace"

/**
 * @swagger
 * /workspace/{workspaceId}:
 *   delete:
 *     summary: Delete a workspace
 *     tags:
 *       - Workspaces
 *     description: Allows an authenticated user to delete a workspace by its ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the workspace to delete
 *     responses:
 *       200:
 *         description: The workspace was successfully deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 response:
 *                   type: null
 *                   example: null
 *                 message:
 *                   type: string
 *                   example: The workspace was successfully deleted
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
 *         description: Server error when deleting the workspace
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
 *                   example: Could not delete workspace from the database
 *                 message:
 *                   type: string
 *                   example: Could not delete workspace from the database
 */
export const deleteWorkspace = async (req: Request, res: Response) => {
  const { workspaceId } = req.params

  try {
    const workspaceDoc = await WorkspaceModel.findById(workspaceId)

    if (!workspaceDoc) {
      return res.status(404).json({
        success: false,
        response: null,
        message: "The workspace was not found",
      })
    }

    await WorkspaceModel.findByIdAndDelete(workspaceId)

    res.status(200).json({
      success: true,
      response: null,
      message: "The workspace was successfully deleted",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      response: error instanceof Error ? error.message : "Unknown error",
      message: "Could not delete workspace from the database",
    })
  }
}
