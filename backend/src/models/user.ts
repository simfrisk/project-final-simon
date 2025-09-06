import { Schema, Document, Types, model } from "mongoose"
import crypto from "crypto"

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
    default:
      "https://res.cloudinary.com/dgr7l5nsx/image/upload/w_100,h_100,c_fill/v1754899421/profile_pictures/wtvbkvjnxrbdzfvjcmbi.png",
  },
  accessToken: {
    type: String,
    default: () => crypto.randomBytes(128).toString("hex"),
  },
  likedComments: [{ type: Schema.Types.ObjectId, ref: "Comment", default: [] }],
  likedReplies: [{ type: Schema.Types.ObjectId, ref: "Reply", default: [] }],
})

export const UserModel = model<UserType>("User", UserSchema)
