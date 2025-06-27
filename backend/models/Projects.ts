import mongoose, { Schema, Document, Types, model } from "mongoose";

export interface Project extends Document {
  projectName: string;
  projectDescription?: string;
  video?: string;
  comments: Types.ObjectId[];
}

const ProjectSchema = new Schema<Project>({
  projectName: { type: String, required: true },
  projectDescription: String,
  video: String,
  comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
});

export const Project = model<Project>("Project", ProjectSchema);