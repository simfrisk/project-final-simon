import mongoose, { Schema, Types, model } from "mongoose"

export interface Project {
  classId: Types.ObjectId
  projectName: string
  projectDescription?: string
  teacher?: string
  video?: string
  thumbnail?: string
  projectCreatedBy: Types.ObjectId
  comments: Types.ObjectId[]
}

const ProjectSchema = new Schema<Project>({
  classId: { type: Schema.Types.ObjectId, ref: "Class", required: true },
  projectName: { type: String, required: true },
  projectDescription: String,
  teacher: String,
  video: String,
  thumbnail: String,
  projectCreatedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
})

export const Project = model<Project>("Project", ProjectSchema)
