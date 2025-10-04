import crypto from "crypto"
import { Request, Response } from "express"
import { WorkspaceInvitationModel } from "../models/WorkspaceInvitation"
import { UserModel } from "../models/user"
import { WorkspacePermissionChecker } from "../utils/workspace-permissions"

/**
 * @swagger
 * /workspace/{workspaceId}/invite:
 *   post:
 *     summary: Create workspace invitation link (teacher-only)
 *     description: Generate an invitation link for students to join a workspace. Only teachers can create invitations. The link expires in 7 days.
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
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Team does not belong to this workspace"
 *       403:
 *         description: Insufficient permissions - Only teachers can create invitations
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

/**
 * @swagger
 * /workspace/{workspaceId}/teams/{teamId}/invite:
 *   post:
 *     summary: Create team-specific invitation link (teacher-only)
 *     description: Generate an invitation link for students to join a specific team in a workspace. Only teachers can create invitations. The link expires in 7 days.
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
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the team to invite users to
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
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Team does not belong to this workspace"
 *       403:
 *         description: Insufficient permissions - Only teachers can create invitations
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
    const { expiresAt } = req.body
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

    // Determine expiration date: use provided date or default to 7 days
    let expirationDate: Date
    if (expiresAt) {
      expirationDate = new Date(expiresAt)
      // Validate that the date is in the future
      if (expirationDate <= new Date()) {
        return res.status(400).json({ message: "Expiration date must be in the future" })
      }
    } else {
      expirationDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days default
    }

    // Create invitation for students only
    const invitation = new WorkspaceInvitationModel({
      workspaceId,
      teamId: teamId || undefined,
      createdBy,
      token,
      expiresAt: expirationDate,
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

/**
 * @swagger
 * /invitation/use:
 *   post:
 *     summary: Use invitation token to join workspace
 *     description: Use a valid invitation token to join a workspace or team. The invitation must not be expired and must match the user's role.
 *     tags:
 *       - Invitations
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: The invitation token to use
 *                 example: "abc123def456ghi789"
 *     responses:
 *       200:
 *         description: Successfully joined workspace
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Successfully joined workspace"
 *       400:
 *         description: Invalid or expired invitation link
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *        403:
 *         description: Role mismatch - invitation is for a different user role
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "This invitation is only for students. Your role is teacher."
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Server error
 */
export const useInvitationToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.body
    const userId = req.user?._id

    const invitation = await WorkspaceInvitationModel.findOne({
      token,
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

    // Add user to workspace (using $addToSet ensures no duplicates even with multiple uses)
    await UserModel.findByIdAndUpdate(userId, {
      $addToSet: { workspaces: invitation.workspaceId },
    })

    res.json({ message: "Successfully joined workspace" })
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" })
  }
}

/**
 * @swagger
 * /workspace/{workspaceId}/invitations:
 *   get:
 *     summary: Get invitation history for workspace (teacher-only)
 *     description: Retrieve the history of all invitations created for a workspace. Only teachers can view this information.
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
 *         description: ID of the workspace to get invitation history for
 *     responses:
 *       200:
 *         description: Invitation history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 invitations:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       workspaceId:
 *                         type: string
 *                       teamId:
 *                         type: string
 *                       createdBy:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *                       token:
 *                         type: string
 *                       expiresAt:
 *                         type: string
 *                         format: date-time
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       403:
 *         description: Insufficient permissions - Only teachers can view invitation history
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "You don't have permission to view invitation history"
 *       500:
 *         description: Server error
 */
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
      .sort({ createdAt: -1 })

    res.json({ invitations })
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" })
  }
}

/**
 * @swagger
 * /invitation/{invitationId}:
 *   delete:
 *     summary: Delete an invitation link (teacher-only)
 *     description: Permanently delete an invitation link. Only teachers can delete invitations.
 *     tags:
 *       - Invitations
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invitationId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the invitation to delete
 *     responses:
 *       200:
 *         description: Invitation deleted successfully
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Invitation not found
 *       500:
 *         description: Server error
 */
export const deleteInvitation = async (req: Request, res: Response) => {
  try {
    const { invitationId } = req.params
    const userId = req.user?._id

    const invitation = await WorkspaceInvitationModel.findById(invitationId)
    if (!invitation) {
      return res.status(404).json({ message: "Invitation not found" })
    }

    // Check if user can delete invitations
    const canDelete = await WorkspacePermissionChecker.canInviteMembers(
      invitation.workspaceId.toString(),
      userId?.toString() || ""
    )
    if (!canDelete) {
      return res.status(403).json({ message: "You don't have permission to delete invitations" })
    }

    await WorkspaceInvitationModel.findByIdAndDelete(invitationId)
    res.json({ message: "Invitation deleted successfully" })
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" })
  }
}

/**
 * @swagger
 * /invitation/{invitationId}/deactivate:
 *   patch:
 *     summary: Deactivate an invitation link (teacher-only)
 *     description: Deactivate an invitation link by setting its expiration date to now. Only teachers can deactivate invitations.
 *     tags:
 *       - Invitations
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invitationId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the invitation to deactivate
 *     responses:
 *       200:
 *         description: Invitation deactivated successfully
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Invitation not found
 *       500:
 *         description: Server error
 */
export const deactivateInvitation = async (req: Request, res: Response) => {
  try {
    const { invitationId } = req.params
    const userId = req.user?._id

    const invitation = await WorkspaceInvitationModel.findById(invitationId)
    if (!invitation) {
      return res.status(404).json({ message: "Invitation not found" })
    }

    // Check if user can deactivate invitations
    const canDeactivate = await WorkspacePermissionChecker.canInviteMembers(
      invitation.workspaceId.toString(),
      userId?.toString() || ""
    )
    if (!canDeactivate) {
      return res
        .status(403)
        .json({ message: "You don't have permission to deactivate invitations" })
    }

    // Set expiration to now to effectively deactivate the invitation
    await WorkspaceInvitationModel.findByIdAndUpdate(invitationId, {
      expiresAt: new Date(),
    })

    res.json({ message: "Invitation deactivated successfully" })
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" })
  }
}
