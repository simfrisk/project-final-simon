import { Request, Response } from "express"
import { TeamModel } from "../models/Team"
import { WorkspaceModel } from "../models/workspace"

/**
 * @swagger
 * /workspace/{workspaceId}/teams:
 *   get:
 *     summary: Retrieve all teams in a workspace
 *     description: Retrieve a list of teams with their names for a specific workspace.
 *     tags:
 *       - Teams
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the workspace to get teams from
 *     responses:
 *       200:
 *         description: A list of teams
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
 *                       teamName:
 *                         type: string
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error fetching teams
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
export const getTeams = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { workspaceId } = req.params

    // Get teams from specific workspace
    const workspace = await WorkspaceModel.findById(workspaceId)
      .populate("teams", "teamName")
      .select("teams")

    if (!workspace) {
      return res.status(404).json({
        success: false,
        response: null,
        message: "Workspace not found",
      })
    }

    return res.status(200).json({
      success: true,
      response: workspace.teams,
      message: "Teams fetched successfully",
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      response: null,
      message: "Failed to fetch teams.",
    })
  }
}
