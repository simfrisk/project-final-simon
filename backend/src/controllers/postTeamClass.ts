import { Request, Response } from "express"
import { TeamModel } from "../models/Team"
import { ClassModel } from "../models/Class"

/**
 * @swagger
 * /teams/{teamId}/classes/{classId}:
 *   post:
 *     summary: Give a team access to a class
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
 *         name: classId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the class to give access to
 *     responses:
 *       200:
 *         description: Class access granted successfully
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
 *                   example: "Class access granted successfully"
 *       400:
 *         description: Bad Request - missing classId
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
 *                   example: "Class ID is required"
 *       404:
 *         description: Team or Class not found
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
 *                   example: "Team or Class not found"
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
export const postTeamClass = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { teamId, classId } = req.params

    const team = await TeamModel.findById(teamId)
    const classDoc = await ClassModel.findById(classId)

    if (!team || !classDoc) {
      return res.status(404).json({
        success: false,
        response: null,
        message: "Team or Class not found",
      })
    }

    // Verify class belongs to same workspace as team
    // Note: This validation would need to be done by checking which workspace contains this team
    // For now, we'll allow any class access (you may want to add workspace validation later)

    // Add class to team's accessTo
    await TeamModel.findByIdAndUpdate(teamId, {
      $addToSet: { accessTo: classId },
    })

    return res.status(200).json({
      success: true,
      response: { teamId, classId },
      message: "Class access granted successfully",
    })
  } catch (error) {
    console.error("Error in postTeamClass:", error)

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
