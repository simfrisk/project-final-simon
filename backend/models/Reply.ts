import mongoose, { Schema, Document, Types, model } from "mongoose";

export interface ReplyType extends Document {
  content: string;
  commentId: Types.ObjectId;
  createdAt: Date;
}

const ReplySchema = new Schema<ReplyType>({
  content: { type: String, required: true },
  commentId: { type: Schema.Types.ObjectId, ref: "Comment", required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Reply = model<ReplyType>("Reply", ReplySchema);