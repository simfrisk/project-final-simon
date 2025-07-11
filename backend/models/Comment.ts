import { Schema, Document, Types, model } from "mongoose";

export interface CommentType extends Document {
  content: string;
  projectId: Types.ObjectId;
  createdAt: Date;
  timeStamp?: string;
  replies: Types.ObjectId[];
}

const CommentSchema = new Schema<CommentType>({
  content: { type: String, required: true },
  projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
  createdAt: { type: Date, default: Date.now },
  timeStamp: String,
  replies: [{ type: Schema.Types.ObjectId, ref: "Reply" }],
});

export const CommentModel = model<CommentType>("Comment", CommentSchema);