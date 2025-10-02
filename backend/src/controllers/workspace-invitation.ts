import crypto from "crypto"
import { Request, Response } from "express"
import { WorkspaceInvitationModel } from "../models/WorkspaceInvitation"
import { UserModel } from "../models/user"
import { WorkspacePermissionChecker } from "../utils/workspace-permissions"

/**
 * @swagger
 * /workspace/{workspaceId}/invite:
 *   post:
 *     summary: Create workspace invitation link (student-only)
 *     description: Generate an invitation link for students to join a workspace. The link expires in 7 days.
 *     tags:
 *       - Invitations
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the workspace to invite users to
 *     responses:
 *       200:
 *         description: Invitation link created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                  message:
 *                    type: string
 *                    example: "Invitation created successfully"
 *                  signupLink:
 *                    type: string
 *                    example: "https://class-review.netlify.app/signUp?token=abc123def456"
 *                  expiresAt:
 *                    type: string
 *                    format: date-time
 *       403:
 *         description: Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "You don't have permission to create invitations"
 *       500:
 *         description: Server error
 */
export const createInvitationLink = async (req: Request, res: Response) => {
  try {
    const { workspaceId, teamId } = req.params
    const createdBy = req.user?._id

    // Check if user can create invitations (only teachers/admins)
    const canInvite = await WorkspacePermissionChecker.canInviteMembers(
      workspaceId,
      createdBy?.toString() || ""
    )
    if (!canInvite) {
      return res.status(403).json({ message: "You don't have permission to create invitations" })
    }

    // If teamId is provided, verify the team belongs to the workspace
    if (teamId) {
      const { TeamModel } = await import("../models/Team")
      const team = await TeamModel.findById(teamId)
      if (!team || team.workspaceId.toString() !== workspaceId) {
        return res.status(400).json({ message: "Team does not belong to this workspace" })
      }
    }

    // Generate unique token
    const token = crypto.randomBytes(32).toString("hex")

    // Create invitation for students only
    const invitation = new WorkspaceInvitationModel({
      workspaceId,
      teamId: teamId || undefined,
      createdBy,
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      allowedRole: "student", // Only allow student signups via invitation links
    })

    await invitation.save()

    // Generate the signup link
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173"
    const signupLink = `${frontendUrl}/signUp?token=${token}`

    res.json({
      message: "Invitation created successfully",
      signupLink,
      expiresAt: invitation.expiresAt,
    })
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" })
  }
}

/**
 * @swagger
 * /invitation/validate/{token}:
 *   get:
 *     summary: Validate invitation token
 *     description: Check if an invitation token is valid and not expired
 *     tags:
 *       - Invitations
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: The invitation token to validate
 *     responses:
 *       200:
 *         description: Token is valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                   example: true
 *                 workspace:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     name:
 *                       type: string
 *                 expiresAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid or expired invitation link"
 *       500:
 *         description: Server error
 */
export const validateInvitationToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.params

    const invitation = await WorkspaceInvitationModel.findOne({
      token,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    }).populate("workspaceId")

    if (!invitation) {
      return res.status(400).json({ message: "Invalid or expired invitation link" })
    }

    res.json({
      valid: true,
      workspace: invitation.workspaceId,
      expiresAt: invitation.expiresAt,
    })
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" })
  }
}

export const useInvitationToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.body
    const userId = req.user?._id

    const invitation = await WorkspaceInvitationModel.findOne({
      token,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    })

    if (!invitation) {
      return res.status(400).json({ message: "Invalid or expired invitation link" })
    }

    // Check if user's role matches the invitation's allowed role
    const user = await UserModel.findById(userId)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    if (user.role !== invitation.allowedRole) {
      return res.status(403).json({
        message: `This invitation is only for ${invitation.allowedRole}s. Your role is ${user.role}.`,
      })
    }

    // Add user to workspace
    await UserModel.findByIdAndUpdate(userId, {
      $addToSet: { workspaces: invitation.workspaceId },
    })

    // Mark invitation as used
    await WorkspaceInvitationModel.findByIdAndUpdate(invitation._id, {
      isUsed: true,
      usedBy: userId,
      usedAt: new Date(),
    })

    res.json({ message: "Successfully joined workspace" })
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" })
  }
}

export const getInvitationHistory = async (req: Request, res: Response) => {
  try {
    const { workspaceId } = req.params
    const userId = req.user?._id

    // Check if user can view invitation history
    const canView = await WorkspacePermissionChecker.canInviteMembers(
      workspaceId,
      userId?.toString() || ""
    )
    if (!canView) {
      return res
        .status(403)
        .json({ message: "You don't have permission to view invitation history" })
    }

    const invitations = await WorkspaceInvitationModel.find({ workspaceId })
      .populate("createdBy", "name email")
      .populate("usedBy", "name email")
      .sort({ createdAt: -1 })

    res.json({ invitations })
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" })
  }
}
