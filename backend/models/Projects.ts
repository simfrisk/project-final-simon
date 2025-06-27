import mongoose, { Document, Types } from "mongoose";

interface Reply {
  reply: string;
  createdAt: Date;
}

interface Comment extends Document {
  message: string;
  createdAt: Date;
  timeStamp: string;
  replies: Reply[];
}

interface Project extends Document {
  projectName: string;
  projectDescription?: string;
  video?: string;
  comments: Types.DocumentArray<Comment>;
}

const ReplySchema = new mongoose.Schema({
  reply: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const CommentSchema = new mongoose.Schema({
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  timeStamp: { type: String },
  replies: [ReplySchema],
});

const ProjectSchema = new mongoose.Schema({
  projectName: { type: String, required: true },
  projectDescription: String,
  video: String,
  comments: { type: [CommentSchema], default: [] },
});

export const Project = mongoose.model<Project>("Project", ProjectSchema);