import crypto from "crypto"
import { Request, Response } from "express"
import { WorkspaceInvitationModel } from "../models/WorkspaceInvitation"
import { WorkspaceModel } from "../models/workspace"
import { UserModel } from "../models/user"
import { WorkspacePermissionChecker } from "../utils/workspace-permissions"

export const createInvitationLink = async (req: Request, res: Response) => {
  try {
    const { workspaceId } = req.params
    const createdBy = req.user?._id

    // Check if user can create invitations (only teachers/admins)
    const canInvite = await WorkspacePermissionChecker.canInviteMembers(
      workspaceId,
      createdBy?.toString() || ""
    )
    if (!canInvite) {
      return res.status(403).json({ message: "You don't have permission to create invitations" })
    }

    // Generate unique token
    const token = crypto.randomBytes(32).toString("hex")

    // Create invitation
    const invitation = new WorkspaceInvitationModel({
      workspaceId,
      createdBy,
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    })

    await invitation.save()

    // Generate the signup link
    const signupLink = `${process.env.FRONTEND_URL}/signup?token=${token}`

    res.json({
      message: "Invitation created successfully",
      signupLink,
      expiresAt: invitation.expiresAt,
    })
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" })
  }
}

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
