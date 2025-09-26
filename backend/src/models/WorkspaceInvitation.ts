import { Schema, Document, Types, model } from "mongoose"

export interface WorkspaceInvitationType extends Document {
  _id: Types.ObjectId
  workspaceId: Types.ObjectId
  createdBy: Types.ObjectId
  token: string
  expiresAt: Date
  isUsed: boolean
  usedBy?: Types.ObjectId
  usedAt?: Date
  allowedRole: string
  schemaVersion: string
}

const WorkspaceInvitationSchema = new Schema<WorkspaceInvitationType>({
  workspaceId: {
    type: Schema.Types.ObjectId,
    ref: "Workspace",
    required: true,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  },
  isUsed: {
    type: Boolean,
    default: false,
  },
  usedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  usedAt: {
    type: Date,
  },
  allowedRole: {
    type: String,
    enum: ["student", "teacher"],
    default: "student",
  },
  schemaVersion: { type: String, default: "v2" },
})

// Index for performance
WorkspaceInvitationSchema.index({ token: 1 })
WorkspaceInvitationSchema.index({ expiresAt: 1 })

export const WorkspaceInvitationModel = model<WorkspaceInvitationType>(
  "WorkspaceInvitation",
  WorkspaceInvitationSchema
)
