import { Request, Response } from "express"
import { TeamModel } from "../models/Team"
import { UserModel } from "../models/user"

/**
 * @swagger
 * /teams/{teamId}/members/{userId}:
 *   delete:
 *     summary: Remove a member from a team
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
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to remove
 *     responses:
 *       200:
 *         description: Member removed successfully
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
 *                   example: "Member removed successfully"
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
export const deleteTeamMember = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { teamId, userId } = req.params

    const team = await TeamModel.findById(teamId)
    const user = await UserModel.findById(userId)

    if (!team || !user) {
      return res.status(404).json({
        success: false,
        response: null,
        message: "Team or User not found",
      })
    }

    // Remove user from team
    await UserModel.findByIdAndUpdate(userId, {
      $pull: { teams: teamId },
    })

    return res.status(200).json({
      success: true,
      response: null,
      message: "Member removed successfully",
    })
  } catch (error) {
    console.error("Error in deleteTeamMember:", error)

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
