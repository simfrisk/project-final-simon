import { Schema, Types, model } from "mongoose"

export type CommentCategory = "question" | "public" | "private"

export interface CommentType {
  content: string
  projectId: Types.ObjectId
  createdAt: Date
  timeStamp?: string
  isChecked: boolean
  replies: Types.ObjectId[]
  commentCreatedBy: Types.ObjectId
  commentType: CommentCategory
  likes: Types.ObjectId[]
}

const CommentSchema = new Schema<CommentType>({
  content: { type: String, required: true },
  projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
  createdAt: { type: Date, default: Date.now },
  timeStamp: String,
  isChecked: { type: Boolean, required: true, default: false },
  replies: [{ type: Schema.Types.ObjectId, ref: "Reply" }],
  commentCreatedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  commentType: {
    type: String,
    enum: ["question", "public", "private"],
    required: true,
  },
  likes: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
})

export const CommentModel = model<CommentType>("Comment", CommentSchema)
