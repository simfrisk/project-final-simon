import { Schema, Document, Types, model } from "mongoose"
import crypto from "crypto"
import { config } from "../config"

export interface UserType extends Document {
  _id: Types.ObjectId
  name: string
  email: string
  password: string
  role: string
  profileImage: string
  accessToken: string
  likedComments: Types.ObjectId[]
  likedReplies: Types.ObjectId[]
  workspaces: Types.ObjectId[]
  teams: Types.ObjectId[]
  assignedTeams: Types.ObjectId[]
  schemaVersion: string
}

const UserSchema = new Schema<UserType>({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 100,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 4,
    maxlength: 100,
    trim: true,
  },
  role: {
    type: String,
    required: true,
    enum: ["teacher", "student"],
  },
  profileImage: {
    type: String,
    // A function, so the value follows MEDIA_PUBLIC_BASE_URL and is never frozen at import time.
    default: () => config.defaultProfileImageUrl,
  },
  accessToken: {
    type: String,
    default: () => crypto.randomBytes(128).toString("hex"),
  },
  likedComments: [{ type: Schema.Types.ObjectId, ref: "Comment", default: [] }],
  likedReplies: [{ type: Schema.Types.ObjectId, ref: "Reply", default: [] }],
  workspaces: [{ type: Schema.Types.ObjectId, ref: "Workspace", default: [] }],
  teams: [{ type: Schema.Types.ObjectId, ref: "Team", default: [] }],
  assignedTeams: [{ type: Schema.Types.ObjectId, ref: "Team", default: [] }],
  schemaVersion: { type: String, default: "v2" },
})

export const UserModel = model<UserType>("User", UserSchema)
