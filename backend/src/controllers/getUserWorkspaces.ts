import { Request, Response } from "express"
import { UserModel } from "../models/user"
import { WorkspaceModel } from "../models/workspace"

/**
 * @swagger
 * /user/workspaces:
 *   get:
 *     summary: Get workspaces for the authenticated user
 *     description: Retrieve all workspaces that the authenticated user belongs to.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User workspaces fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 response:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                 message:
 *                   type: string
 *                   example: "User workspaces fetched successfully"
 *       404:
 *         description: User not found
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
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Server error fetching user workspaces
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
 *                 message:
 *                   type: string
 *                   example: "Failed to fetch user workspaces"
 */
export const getUserWorkspaces = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = req.user?._id

    if (!userId) {
      return res.status(401).json({
        success: false,
        response: null,
        message: "User not authenticated",
      })
    }

    const user = await UserModel.findById(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        response: null,
        message: "User not found",
      })
    }

    // Populate workspace details
    const workspaces = await WorkspaceModel.find({
      _id: { $in: user.workspaces },
    }).select("name createdAt")

    return res.status(200).json({
      success: true,
      response: workspaces,
      message: "User workspaces fetched successfully",
    })
  } catch (error) {
    console.error("Error in getUserWorkspaces:", error)

    return res.status(500).json({
      success: false,
      response: null,
      message: "Failed to fetch user workspaces",
    })
  }
}
