import { Request, Response } from "express"
import { TeamModel } from "../models/Team"
import { WorkspaceModel } from "../models/workspace"
import { UserModel } from "../models/user"

/**
 * @swagger
 * /workspace/{workspaceId}/teams:
 *   post:
 *     summary: Create a new team within a workspace
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
 *         description: ID of the workspace to add the team to
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - teamName
 *             properties:
 *               teamName:
 *                 type: string
 *                 example: "Math Team A"
 *     responses:
 *       201:
 *         description: Team created successfully
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
 *                     teamName:
 *                       type: string
 *                 message:
 *                   type: string
 *                   example: "Team created successfully"
 *       400:
 *         description: Bad Request - missing teamName
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
 *                   example: "Team name is required"
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
export const postTeam = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { teamName } = req.body
    const { workspaceId } = req.params
    const createdBy = req.user?._id

    if (!teamName) {
      return res.status(400).json({
        success: false,
        response: null,
        message: "Team name is required",
      })
    }

    // Verify workspace exists
    const workspace = await WorkspaceModel.findById(workspaceId)
    if (!workspace) {
      return res.status(404).json({
        success: false,
        response: null,
        message: "Workspace not found",
      })
    }

    const newTeam = new TeamModel({
      teamName,
      createdBy,
      workspaceId,
    })
    const savedNewTeam = await newTeam.save()

    // Add team to workspace
    await WorkspaceModel.findByIdAndUpdate(workspaceId, {
      $addToSet: { teams: savedNewTeam._id },
    })

    return res.status(201).json({
      success: true,
      response: savedNewTeam,
      message: "Team created successfully",
    })
  } catch (error) {
    console.error("Error in postTeam:", error)

    if (error instanceof Error) {
      return res.status(500).json({
        success: false,
        response: null,
        message: error.message,
      })
    }

    return res.status(500).json({
      success: false,
      response: null,
      message: "Unknown server error",
    })
  }
}
