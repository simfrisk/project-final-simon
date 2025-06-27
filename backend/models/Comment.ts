import mongoose, { Schema, Document, Types, model } from "mongoose";

export interface Comment extends Document {
  content: string;
  projectId: Types.ObjectId;
  createdAt: Date;
  timeStamp?: string;
  replies: Types.ObjectId[];
}

const CommentSchema = new Schema<Comment>({
  content: { type: String, required: true },
  projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
  createdAt: { type: Date, default: Date.now },
  timeStamp: String,
  replies: [{ type: Schema.Types.ObjectId, ref: "Reply" }],
});

export const Comment = model<Comment>("Comment", CommentSchema);