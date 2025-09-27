import { Request, Response } from "express"
import { TeamModel } from "../models/Team"
import { UserModel } from "../models/user"

/**
 * @swagger
 * /teams/{teamId}/members:
 *   post:
 *     summary: Add a member to a team
 *     tags:
 *       - Teams
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the team
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "60f7b3b3b3b3b3b3b3b3b3b3"
 *     responses:
 *       200:
 *         description: Member added successfully
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
 *                   example: "Member added successfully"
 *       400:
 *         description: Bad Request - missing userId
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
 *                   example: "User ID is required"
 *       404:
 *         description: Team or User not found
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
 *                   example: "Team or User not found"
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
export const postTeamMember = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { teamId } = req.params
    const { userId } = req.body

    if (!userId) {
      return res.status(400).json({
        success: false,
        response: null,
        message: "User ID is required",
      })
    }

    const team = await TeamModel.findById(teamId)
    const user = await UserModel.findById(userId)

    if (!team || !user) {
      return res.status(404).json({
        success: false,
        response: null,
        message: "Team or User not found",
      })
    }

    // Add user to team
    await UserModel.findByIdAndUpdate(userId, {
      $addToSet: { teams: teamId },
    })

    return res.status(200).json({
      success: true,
      response: { teamId, userId },
      message: "Member added successfully",
    })
  } catch (error) {
    console.error("Error in postTeamMember:", error)

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
