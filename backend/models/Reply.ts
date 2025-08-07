import { Schema, Document, Types, model } from "mongoose";

export interface ReplyType {
  content: string;
  commentId: Types.ObjectId;
  createdAt: Date;
  isChecked: boolean;
  replyCreatedBy: Types.ObjectId;
  replyLikes: Types.ObjectId[];
}

const ReplySchema = new Schema<ReplyType>({
  content: { type: String, required: true },
  commentId: { type: Schema.Types.ObjectId, ref: "Comment", required: true },
  createdAt: { type: Date, default: Date.now },
  isChecked: { type: Boolean, required: true },
  replyCreatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  replyLikes: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }]
});

export const Reply = model<ReplyType>("Reply", ReplySchema);