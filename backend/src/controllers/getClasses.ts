import { Request, Response } from "express"
import { ClassModel } from "../models/Class"
import { TeamModel } from "../models/Team"
import { UserModel } from "../models/user"

/**
 * @swagger
 * /workspace/{workspaceId}/classes:
 *   get:
 *     summary: Retrieve classes in a workspace based on user role
 *     description: |
 *       Retrieve a list of classes with their titles for a specific workspace.
 *       - Teachers see all classes in the workspace
 *       - Students only see classes their teams have access to
 *     tags:
 *       - Classes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the workspace to get classes from
 *     responses:
 *       200:
 *         description: A list of classes (filtered by user role and team access for students)
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
 *                       classTitle:
 *                         type: string
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error fetching classes
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
export const getClasses = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { workspaceId } = req.params
    const userId = req.user?._id

    // Get the user to check their role
    const user = await UserModel.findById(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        response: null,
        message: "User not found",
      })
    }

    let result

    // Teachers see all classes in the workspace
    if (user.role === "teacher") {
      result = await ClassModel.find({ workspaceId }).select("classTitle workspaceId")
    } else {
      // Students only see classes their teams have access to
      // Get all teams the student belongs to in this workspace
      const userTeams = await TeamModel.find({
        _id: { $in: user.teams },
        workspaceId: workspaceId,
      }).select("accessTo")

      // Collect all class IDs from all teams
      const accessibleClassIds = userTeams.flatMap((team) => team.accessTo)

      // Get unique class IDs
      const uniqueClassIds = [...new Set(accessibleClassIds.map((id) => id.toString()))]

      // Fetch the classes
      result = await ClassModel.find({
        _id: { $in: uniqueClassIds },
        workspaceId: workspaceId,
      }).select("classTitle workspaceId")
    }

    return res.status(200).json({
      success: true,
      response: result,
      message: "Classes fetched successfully",
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      response: null,
      message: "Failed to fetch classes.",
    })
  }
}
