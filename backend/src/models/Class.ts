import { Schema, model, Types } from "mongoose"

export interface ClassType {
  classTitle: string
  projects: Types.ObjectId[]
  workspaceId: Types.ObjectId
  schemaVersion: string
}

const ClassSchema = new Schema<ClassType>({
  classTitle: { type: String, required: true, maxlength: 100, trim: true },
  projects: [{ type: Schema.Types.ObjectId, ref: "Project" }],
  workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
  schemaVersion: { type: String, default: "v2" },
})

export const ClassModel = model<ClassType>("Class", ClassSchema)
