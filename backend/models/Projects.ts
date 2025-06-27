import mongoose, { Schema, Types, Document, model } from "mongoose";

const ReplySchema = new Schema({
  reply: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const CommentSchema = new Schema({
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  timeStamp: { type: String },
  replies: [ReplySchema],
});

const ProjectSchema = new Schema({
  projectName: { type: String, required: true },
  projectDescription: String,
  video: String,
  comments: { type: [CommentSchema], default: [] },
});

// Define interfaces

interface Reply extends Document {
  reply: string;
  createdAt: Date;
}

interface Comment extends Document {
  message: string;
  createdAt: Date;
  timeStamp?: string;
  replies: Types.DocumentArray<Reply>;
}

export interface Project extends Document {
  projectName: string;
  projectDescription?: string;
  video?: string;
  comments: Types.DocumentArray<Comment>;
}

export const Project = model<Project>("Project", ProjectSchema);