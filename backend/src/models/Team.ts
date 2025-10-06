import { Schema, Document, Types, model } from "mongoose"

export interface TeamType extends Document {
  _id: Types.ObjectId
  teamName: string
  createdBy: Types.ObjectId
  createdAt: Date
  assignedTeachers: Types.ObjectId[]
  assignedStudents: Types.ObjectId[]
  workspaceId: Types.ObjectId
  accessTo: Types.ObjectId[]
  schemaVersion: string
}

const TeamSchema = new Schema<TeamType>({
  teamName: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 100,
    trim: true,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  assignedTeachers: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
  assignedStudents: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
  workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
  accessTo: [{ type: Schema.Types.ObjectId, ref: "Class", default: [] }],
  schemaVersion: { type: String, default: "v2" },
})

export const TeamModel = model<TeamType>("Team", TeamSchema)
