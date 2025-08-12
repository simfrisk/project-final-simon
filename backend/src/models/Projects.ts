import mongoose, { Schema, Types, model } from "mongoose";

export interface Project {
  classId: Types.ObjectId;
  projectName: string;
  projectDescription?: string;
  video?: string;
  thumbnail?: string
  comments: Types.ObjectId[];
}

const ProjectSchema = new Schema<Project>({
  classId: { type: Schema.Types.ObjectId, ref: "Class", required: true },
  projectName: { type: String, required: true },
  projectDescription: String,
  video: String,
  thumbnail: String,
  comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
});

export const Project = model<Project>("Project", ProjectSchema);  