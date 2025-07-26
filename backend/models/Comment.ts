import { Schema, Document, Types, model } from "mongoose";

export interface CommentType extends Document {
  content: string;
  projectId: Types.ObjectId;
  createdAt: Date;
  timeStamp?: string;
  isChecked: boolean;
  replies: Types.ObjectId[];
  commentCreatedBy: Types.ObjectId;
}

const CommentSchema = new Schema<CommentType>({
  content: { type: String, required: true },
  projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
  createdAt: { type: Date, default: Date.now },
  timeStamp: String,
  isChecked: { type: Boolean, required: true, default: false },
  replies: [{ type: Schema.Types.ObjectId, ref: "Reply" }],
  commentCreatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

export const CommentModel = model<CommentType>("Comment", CommentSchema);