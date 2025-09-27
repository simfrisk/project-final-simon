import { Schema, Document, Types, model } from "mongoose"

export interface WorkspaceType extends Document {
  _id: Types.ObjectId
  name: string
  createdBy: Types.ObjectId
  createdAt: Date
  teams: Types.ObjectId[]
  schemaVersion: string
}

const WorkspaceSchema = new Schema<WorkspaceType>({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 60,
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
  teams: [{ type: Schema.Types.ObjectId, ref: "Team", default: [] }],
  schemaVersion: { type: String, default: "v2" },
})

export const WorkspaceModel = model<WorkspaceType>("Workspace", WorkspaceSchema)
