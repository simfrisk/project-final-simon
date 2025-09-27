import { Request, Response } from "express"
import { WorkspaceModel } from "../models/workspace"

/**
 * @swagger
 * /workspace:
 *   post:
 *     summary: Create a new workspace
 *     tags:
 *       - Workspaces
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Math Department"
 *     responses:
 *       201:
 *         description: Workspace created successfully
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
 *                     name:
 *                       type: string
 *                 message:
 *                   type: string
 *                   example: "Workspace created successfully"
 *       400:
 *         description: Bad Request - missing name
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
 *                   example: "Workspace name is required"
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
export const postWorkspace = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { name } = req.body
    const createdBy = req.user._id

    if (!name) {
      return res.status(400).json({
        success: false,
        response: null,
        message: "Workspace name is required",
      })
    }

    const newWorkspace = new WorkspaceModel({
      name,
      createdBy,
    })
    const savedNewWorkspace = await newWorkspace.save()

    return res.status(201).json({
      success: true,
      response: savedNewWorkspace,
      message: "Workspace created successfully",
    })
  } catch (error) {
    console.error("Error in postWorkspace:", error)

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
